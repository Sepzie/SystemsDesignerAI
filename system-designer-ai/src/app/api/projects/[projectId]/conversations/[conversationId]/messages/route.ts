import { NextRequest, NextResponse } from 'next/server';
import {
  validateUser,
  validateProjectAccess,
  getPaginationParams,
  ApiError,
} from '@/lib/api-utils';
import {
  CreateMessageRequest,
  CreateMessageResponse,
  ListMessagesResponse,
} from '@/types/api';
import { createClient } from '@/lib/supabase/server';
import { langChainClient } from '@/lib/langchain/client';
import { AssetService } from '@/lib/asset/asset-service';
import { Message } from '@/types/chat';
import { AssetType } from '@/types/asset';
import { SupabaseClient } from '@supabase/supabase-js';

const assetService = new AssetService();
let supabase: SupabaseClient;

// Initialize Supabase client
createClient().then(client => {
  supabase = client;
});

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; conversationId: string } }
) {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', params.conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; conversationId: string } }
) {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const body = await request.json();
    const { content, type = 'design' } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Process the message through LangChain
    const response = await langChainClient.processMessage(
      content,
      '', // Context will be built by the client
      type as 'design' | 'review' | 'selection' | 'asset',
      params.projectId,
      params.conversationId
    );

    // Store the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([{
        id: response.message.id,
        conversation_id: params.conversationId,
        role: response.message.role,
        content: response.message.content,
        metadata: response.message.metadata,
        created_at: response.message.created_at
      }])
      .select()
      .single();

    if (messageError) throw messageError;

    // Store assets and create references
    if (response.assets) {
      for (const asset of response.assets) {
        const now = new Date();
        // Store the asset
        const storedAsset = await assetService.storeAsset({
          project_id: params.projectId,
          name: asset.name,
          asset_type: asset.type as AssetType,
          current_content: asset.content,
          current_version: 1,
          created_at: now,
          updated_at: now,
          metadata: {
            created_at: new Date(now),
            updated_at: new Date(now),
            created_by_message_id: response.message.id,
            version_number: 1,
            reference_type: 'creation'
          }
        });

        // Create the asset reference
        await assetService.createAssetReference({
          message_id: response.message.id,
          asset_id: storedAsset.id,
          version_referenced: 1,
          reference_type: 'creation'
        });
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 