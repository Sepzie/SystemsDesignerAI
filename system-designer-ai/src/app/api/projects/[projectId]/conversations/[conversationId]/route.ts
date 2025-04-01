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
        created_at: new Date(conversation.started_at),
        updated_at: new Date(conversation.updated_at),
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