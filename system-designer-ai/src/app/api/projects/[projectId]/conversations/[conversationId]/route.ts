import { NextRequest, NextResponse } from 'next/server';
import {
  validateUser,
  validateProjectAccess,
  ApiError,
} from '@/lib/api-utils';
import { GetConversationResponse } from '@/types/api';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; conversationId: string }> }
) {
  try {
    const { projectId, conversationId } = await params;
    const supabase = await createClient();
    const user = await validateUser(supabase);
    await validateProjectAccess(supabase, user.id, projectId);

    // Get the conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('project_id', projectId)
      .single();

    if (convError || !conversation) {
      throw new ApiError('Conversation not found', 404);
    }

    // Get messages for the conversation
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      throw new ApiError('Failed to fetch messages', 500);
    }

    const response: GetConversationResponse = {
      conversation: {
        id: conversation.id,
        project_id: conversation.project_id,
        title: conversation.title,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        last_message_at: conversation.last_message_at,
        message_count: conversation.message_count,
      },
      messages: messages.map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        conversationId: msg.conversation_id,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata,
        created_at: msg.created_at,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: { message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; conversationId: string }> }
) {
  try {
    const { projectId, conversationId } = await params;
    const supabase = await createClient();
    
    // Validate user is authenticated
    const user = await validateUser(supabase);
    await validateProjectAccess(supabase, user.id, projectId);

    // First, verify the conversation exists
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('project_id')
      .eq('id', conversationId)
      .eq('project_id', projectId)
      .single();

    if (convError || !conversation) {
      console.error('Conversation not found:', convError);
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Delete all messages in the conversation
    // Note: Due to ON DELETE CASCADE in the database schema, this isn't strictly necessary
    // but it's good practice to be explicit
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Failed to delete messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to delete messages' },
        { status: 500 }
      );
    }

    // Delete the conversation
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error('Failed to delete conversation:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 