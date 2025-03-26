import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ProjectFormData } from '@/types/project'

// Validation function for project data
function validateProjectData(data: Partial<ProjectFormData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Project name is required');
  }

  if (!data.description?.trim()) {
    errors.push('Description is required');
  }

  if (!data.requirements) {
    errors.push('Requirements are required');
  } else {
    const { functional, nonFunctional } = data.requirements;
    
    if (!Array.isArray(functional) || functional.length === 0 || functional.some(req => !req.trim())) {
      errors.push('At least one functional requirement is required');
    }

    if (!Array.isArray(nonFunctional) || nonFunctional.length === 0 || nonFunctional.some(req => !req.trim())) {
      errors.push('At least one non-functional requirement is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// GET: Fetch all projects for authenticated user
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

  const { data, error } = await supabase
    .from('Project')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ projects: data })
}

// POST: Create a new project
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
    const projectData = await request.json() as ProjectFormData;

    // Validate the project data
    const validation = validateProjectData(projectData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Prepare data for database
    const { name, description, requirements, techStack } = projectData;
    const dbData = {
      user_id: session.user.id,
      name: name.trim(),
      description: description.trim(),
      requirements: {
        functional: requirements.functional.map(req => req.trim()),
        nonFunctional: requirements.nonFunctional.map(req => req.trim())
      },
      tech_stack: techStack?.trim() || '',
      progress: 0
    };

    // Insert the project
    const { data, error } = await supabase
      .from('Project')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create project', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Project created successfully',
      project: data
    }, { status: 201 });

  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { error: 'Invalid request data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
} 