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
import { Message } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; conversationId: string }> }
) {
  try {
    const supabase = await createClient();
    const { conversationId } = await params;
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
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
  { params }: { params: Promise<{ projectId: string; conversationId: string }> }
) {
  try {
    const supabase = await createClient();
    const { conversationId } = await params;
    const body = await request.json();
    const { content, type = 'design' } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Create a placeholder message for the user's input
    const messageId = uuidv4();
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([{
        id: messageId,
        conversation_id: conversationId,
        role: 'user',
        content,
        metadata: {
          type,
          status: 'pending',
          created_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (messageError) throw messageError;

    // Return the message ID for the stream endpoint
    return NextResponse.json({
      messageId,
      message: {
        id: messageId,
        conversation_id: conversationId,
        role: 'user',
        content,
        metadata: message.metadata,
        created_at: message.created_at
      }
    });
  } catch (error) {
    console.error('Error storing message:', error);
    return NextResponse.json(
      { error: 'Failed to store message' },
      { status: 500 }
    );
  }
} 