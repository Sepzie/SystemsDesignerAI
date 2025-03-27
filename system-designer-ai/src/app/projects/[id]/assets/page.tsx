import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import MainLayout from '@/components/layout/MainLayout'
import { ProjectHeader } from '@/components/project/ProjectHeader'
import { ProjectNavigation } from '@/components/project/ProjectNavigation'
import { ProjectContent } from '@/components/project/ProjectContent'

export default async function ProjectAssetsPage({
  params,
}: {
  params: { id: string }
}) {
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

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch project data
  const { data: project, error: projectError } = await supabase
    .from('Project')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (projectError || !project) {
    redirect('/dashboard')
  }

  return (
    <MainLayout isLoggedIn={true} userEmail={user.email}>
      <div className="container mx-auto px-4 py-8">
        <ProjectHeader project={project} />
        <ProjectNavigation projectId={project.id} />
        <ProjectContent project={project} />
      </div>
    </MainLayout>
  )
} 