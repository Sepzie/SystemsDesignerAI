import { NextResponse } from 'next/server'
import { ProjectFormData, ProjectRequirements } from '@/types/project'
import { createClient } from '@/lib/supabase/server'

// Validation function
function validateProjectData(data: any): data is ProjectFormData {
  if (!data || typeof data !== 'object') return false
  if (!data.name || typeof data.name !== 'string') return false
  if (!data.description || typeof data.description !== 'string') return false
  if (typeof data.techStack !== 'string') return false
  return true
}


// GET: Fetch all projects for authenticated user
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new project
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received project data:', body)

    if (!validateProjectData(body)) {
      return NextResponse.json(
        { error: 'Invalid project data' },
        { status: 400 }
      )
    }

    // Filter out empty requirements and prepare the project data
    const projectData = {
      name: body.name.trim(),
      description: body.description.trim(),
      requirements: {
        functional: [],
        nonFunctional: []
      },
      tech_stack: body.techStack.trim(),
      user_id: user.id,
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Inserting project data:', projectData)

    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { 
          error: 'Failed to create project',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    if (!project) {
      console.error('No project data returned from insert')
      return NextResponse.json(
        { error: 'Failed to create project: No data returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Unexpected error in POST /api/projects:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 