import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET: Fetch all conversations (requires project_id query parameter)
export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const projectId = url.searchParams.get('project_id')

  if (!projectId) {
    return NextResponse.json(
      { error: 'project_id query parameter is required' },
      { status: 400 }
    )
  }

  // Verify user owns this project
  const { data: projectData, error: projectError } = await supabase
    .from('Project')
    .select('user_id')
    .eq('id', projectId)
    .single()
  
  if (projectError || !projectData) {
    return NextResponse.json(
      { error: 'Project not found' }, 
      { status: 404 }
    )
  }
  
  if (projectData.user_id !== session.user.id) {
    return NextResponse.json(
      { error: 'You do not have permission to access this project' },
      { status: 403 }
    )
  }

  const { data, error } = await supabase
    .from('Conversation')
    .select('*')
    .eq('project_id', projectId)
    .order('started_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ conversations: data })
}

// POST: Create a new conversation
export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { project_id } = await request.json()

    if (!project_id) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      )
    }

    // Verify user owns this project
    const { data: projectData, error: projectError } = await supabase
      .from('Project')
      .select('user_id')
      .eq('id', project_id)
      .single()
    
    if (projectError || !projectData) {
      return NextResponse.json(
        { error: 'Project not found' }, 
        { status: 404 }
      )
    }
    
    if (projectData.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to access this project' },
        { status: 403 }
      )
    }

    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('Conversation')
      .insert([
        { 
          project_id,
          started_at: now,
          updated_at: now
        }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
} 