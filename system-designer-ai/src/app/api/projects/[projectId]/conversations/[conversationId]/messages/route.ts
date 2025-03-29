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
import { Message } from '@/types/chat';
import { SupabaseClient } from '@supabase/supabase-js';

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

    // Store the message with its asset references
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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 