import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MainLayout from '@/components/layout/MainLayout'
import { ProjectList } from '@/components/project/ProjectList'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get user details for the UI
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <MainLayout isLoggedIn={true} userEmail={user?.email}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--ink)]">My Projects</h1>
            <p className="text-[var(--ink-muted)] mt-1">Track and refine your system designs.</p>
          </div>
          <Link href="/projects/new">
            <Button>Create New Project</Button>
          </Link>
        </div>

        <ProjectList />
      </div>
    </MainLayout>
  )
} 
