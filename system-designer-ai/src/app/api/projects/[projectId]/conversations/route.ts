import { NextRequest, NextResponse } from 'next/server';
import {
  getServerSupabase,
  validateUser,
  validateProjectAccess,
  ApiError,
} from '@/lib/api-utils';
import {
  CreateConversationRequest,
  CreateConversationResponse,
  ListConversationsResponse,
} from '@/types/api';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await getServerSupabase();
    const user = await validateUser(supabase);
    await validateProjectAccess(supabase, user.id, params.projectId);

    // Get conversations for the project
    const { data: conversations, error } = await supabase
      .from('Conversation')
      .select('*')
      .eq('project_id', params.projectId)
      .order('started_at', { ascending: false });

    if (error) {
      throw new ApiError('Failed to fetch conversations', 500);
    }

    const response: ListConversationsResponse = {
      conversations: conversations.map(conv => ({
        id: conv.id,
        projectId: conv.project_id,
        startedAt: new Date(conv.started_at),
        updatedAt: new Date(conv.updated_at),
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
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await getServerSupabase();
    const user = await validateUser(supabase);
    await validateProjectAccess(supabase, user.id, params.projectId);

    const body: CreateConversationRequest = await req.json();

    // Create a new conversation
    const now = new Date().toISOString();
    const { data: conversation, error } = await supabase
      .from('Conversation')
      .insert({
        project_id: params.projectId,
        started_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new ApiError('Failed to create conversation', 500);
    }

    const response: CreateConversationResponse = {
      conversation: {
        id: conversation.id,
        projectId: conversation.project_id,
        startedAt: new Date(conversation.started_at),
        updatedAt: new Date(conversation.updated_at),
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