import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ProjectResponse } from '@/types/api'

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// GET: Fetch a specific project by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    // Validate project ID
    if (!projectId || !isValidUUID(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError) {
      console.error('Database error:', projectError);
      if (projectError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' }, 
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Internal server error', details: projectError.message }, 
        { status: 500 }
      )
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' }, 
        { status: 404 }
      )
    }

    // Fetch project assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
      return NextResponse.json(
        { error: 'Failed to fetch project assets' },
        { status: 500 }
      )
    }

    // Fetch latest conversation and its messages
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })
      .limit(1)

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return NextResponse.json(
        { error: 'Failed to fetch project conversations' },
        { status: 500 }
      )
    }

    let latestConversation: ProjectResponse['latest_conversation'] = undefined;
    if (conversations && conversations.length > 0) {
      const latestConv = conversations[0];
      
      // Fetch messages for the latest conversation
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', latestConv.id)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return NextResponse.json(
          { error: 'Failed to fetch conversation messages' },
          { status: 500 }
        )
      }

      latestConversation = {
        id: latestConv.id,
        title: latestConv.title,
        started_at: latestConv.started_at,
        updated_at: latestConv.updated_at,
        messages: messages || []
      };
    }

    // Construct the enhanced response
    const response: ProjectResponse = {
      id: project.id,
      name: project.name,
      description: project.description,
      tech_stack: project.tech_stack || [],
      metadata: project.metadata || {},
      created_at: project.created_at,
      updated_at: project.updated_at,
      assets: assets || [],
      latest_conversation: latestConversation
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

// PUT: Update a project
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updates = await request.json()
    
    // Verify user owns this project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (projectError || !projectData) {
      return NextResponse.json(
        { error: 'Project not found' }, 
        { status: 404 }
      )
    }
    
    if (projectData.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this project' },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('projects')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}

// DELETE: Delete a project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user owns this project
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', id)
    .single()
  
  if (projectError || !projectData) {
    return NextResponse.json(
      { error: 'Project not found' }, 
      { status: 404 }
    )
  }
  
  if (projectData.user_id !== user.id) {
    return NextResponse.json(
      { error: 'You do not have permission to delete this project' },
      { status: 403 }
    )
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
} 