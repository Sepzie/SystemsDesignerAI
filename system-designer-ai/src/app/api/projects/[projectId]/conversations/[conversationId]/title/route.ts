import { NextRequest, NextResponse } from 'next/server';
import {
  validateUser,
  validateProjectAccess,
} from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; conversationId: string }> }
) {
  try {
    const { projectId, conversationId } = await params;
    const supabase = await createClient();
    
    // Validate user is authenticated
    const user = await validateUser(supabase);
    await validateProjectAccess(supabase, user.id, projectId);

    // Get the request body
    const { title } = await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }

    // Update the conversation title
    const { data: conversation, error } = await supabase
      .from('conversations')
      .update({ 
        title,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update conversation title:', error);
      return NextResponse.json(
        { error: 'Failed to update conversation title' },
        { status: 500 }
      );
    }

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in update conversation title:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
