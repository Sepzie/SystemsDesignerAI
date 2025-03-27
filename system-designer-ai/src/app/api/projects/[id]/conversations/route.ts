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
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient();
    const projectId = params.projectId;

    // Get conversations for the project
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch conversations:', error);
      return NextResponse.json(
        { error: { message: 'Failed to fetch conversations' } },
        { status: 500 }
      );
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
    console.error('Error in get conversations:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { projectId } = await request.json() as CreateConversationRequest;

    // Validate project exists and user has access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: { message: 'Project not found' } },
        { status: 404 }
      );
    }

    // Create new conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert([
        {
          project_id: projectId,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (conversationError) {
      console.error('Failed to create conversation:', conversationError);
      return NextResponse.json(
        { error: { message: 'Failed to create conversation' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error in create conversation:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
} 