import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: Fetch a specific project by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message }, 
      { status: error.code === 'PGRST116' ? 404 : 500 }
    )
  }

  return NextResponse.json(data)
}

// PUT: Update a project
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
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
    
    if (projectData.user_id !== session.user.id) {
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

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
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
  
  if (projectData.user_id !== session.user.id) {
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