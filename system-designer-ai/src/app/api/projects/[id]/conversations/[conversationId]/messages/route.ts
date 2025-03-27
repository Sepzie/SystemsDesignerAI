import { NextRequest, NextResponse } from 'next/server';
import {
  getServerSupabase,
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

export async function GET(
  request: Request,
  { params }: { params: { id: string; conversationId: string } }
) {
  try {
    const supabase = await createClient();
    const { id: projectId, conversationId } = params;

    // Get URL parameters for pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get messages for conversation
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch messages:', error);
      return NextResponse.json(
        { error: { message: 'Failed to fetch messages' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in get messages:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; conversationId: string } }
) {
  try {
    const supabase = await createClient();
    const { id: projectId, conversationId } = params;
    const messageData = await request.json() as CreateMessageRequest;

    // Validate conversation exists and belongs to project
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('project_id', projectId)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: { message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    // Create new message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role: messageData.role,
          content: messageData.content,
          created_at: new Date().toISOString(),
          metadata: messageData.metadata,
        },
      ])
      .select()
      .single();

    if (messageError) {
      console.error('Failed to create message:', messageError);
      return NextResponse.json(
        { error: { message: 'Failed to create message' } },
        { status: 500 }
      );
    }

    // Update conversation's updated_at timestamp
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Failed to update conversation timestamp:', updateError);
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in create message:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
} 