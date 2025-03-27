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

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string; conversationId: string } }
) {
  try {
    const supabase = await getServerSupabase();
    const user = await validateUser(supabase);
    await validateProjectAccess(supabase, user.id, params.projectId);

    // Verify conversation exists and belongs to project
    const { data: conversation, error: convError } = await supabase
      .from('Conversation')
      .select('*')
      .eq('id', params.conversationId)
      .eq('project_id', params.projectId)
      .single();

    if (convError || !conversation) {
      throw new ApiError('Conversation not found', 404);
    }

    // Get messages with pagination
    const { limit, offset } = getPaginationParams(req as any);
    const { data: messages, error: msgError } = await supabase
      .from('Message')
      .select('*')
      .eq('conversation_id', params.conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (msgError) {
      throw new ApiError('Failed to fetch messages', 500);
    }

    const response: ListMessagesResponse = {
      messages: messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata,
        timestamp: new Date(msg.created_at),
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

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string; conversationId: string } }
) {
  try {
    const supabase = await getServerSupabase();
    const user = await validateUser(supabase);
    await validateProjectAccess(supabase, user.id, params.projectId);

    // Verify conversation exists and belongs to project
    const { data: conversation, error: convError } = await supabase
      .from('Conversation')
      .select('*')
      .eq('id', params.conversationId)
      .eq('project_id', params.projectId)
      .single();

    if (convError || !conversation) {
      throw new ApiError('Conversation not found', 404);
    }

    const body: CreateMessageRequest = await req.json();

    // Create the message
    const { data: message, error: msgError } = await supabase
      .from('Message')
      .insert({
        conversation_id: params.conversationId,
        role: body.role,
        content: body.content,
        metadata: body.metadata,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (msgError) {
      throw new ApiError('Failed to create message', 500);
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('Conversation')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.conversationId);

    const response: CreateMessageResponse = {
      message: {
        id: message.id,
        conversationId: message.conversation_id,
        role: message.role,
        content: message.content,
        metadata: message.metadata,
        timestamp: new Date(message.created_at),
      },
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