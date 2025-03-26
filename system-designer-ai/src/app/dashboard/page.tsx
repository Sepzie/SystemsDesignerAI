import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MainLayout from '@/components/layout/MainLayout'
import { ProjectList } from '@/components/project/ProjectList'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from('Project')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <MainLayout isLoggedIn={true} userEmail={user.email}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <Link href="/projects/new">
            <Button>Create New Project</Button>
          </Link>
        </div>

        <ProjectList />
      </div>
    </MainLayout>
  )
} 