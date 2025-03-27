import { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ErrorResponse } from '@/types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function withErrorHandling<T>(
  req: NextApiRequest,
  res: NextApiResponse<T | ErrorResponse>,
  handler: () => Promise<T>
) {
  try {
    const result = await handler();
    return res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        error: {
          message: error.message,
          code: error.code,
        },
      });
    }

    return res.status(500).json({
      error: {
        message: 'An unexpected error occurred',
      },
    });
  }
}

export async function getServerSupabase() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

export async function validateUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new ApiError('Unauthorized', 401);
  }
  
  return user;
}

export async function validateProjectAccess(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  projectId: string
) {
  const { data: project, error } = await supabase
    .from('Project')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !project) {
    throw new ApiError('Project not found or access denied', 404);
  }

  return project;
}

export function getPaginationParams(req: NextApiRequest) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
} 