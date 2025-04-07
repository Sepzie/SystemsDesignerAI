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
import { Message } from '@/types/base-types';
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
    const userMessageId = uuidv4();
    
    const userMessageData = {
      id: userMessageId,
      conversation_id: conversationId,
      role: 'user',
      content,
      metadata: {
        type,
        status: 'pending',
        created_at: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };

    const { data: userMessage, error: userMessageError } = await supabase
      .from('messages')
      .insert([userMessageData])
      .select()
      .single();

    if (userMessageError) throw userMessageError;

    // Create a placeholder AI message for streaming
    const aiMessageId = uuidv4();
    
    const aiMessageData = {
      id: aiMessageId,
      conversation_id: conversationId,
      role: 'assistant',
      content: 'Thinking...',
      metadata: {
        type,
        status: 'pending',
        created_at: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };

    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('messages')
      .insert([aiMessageData])
      .select()
      .single();

    if (aiMessageError) throw aiMessageError;

    const response = {
      messageId: userMessageId,
      aiMessageId: aiMessageId,
      message: {
        id: userMessageId,
        conversation_id: conversationId,
        role: 'user',
        content,
        metadata: userMessage.metadata,
        created_at: userMessage.created_at
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to store message' },
      { status: 500 }
    );
  }
} 