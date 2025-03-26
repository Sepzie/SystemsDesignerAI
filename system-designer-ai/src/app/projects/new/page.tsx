import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectCreationForm } from '@/components/project/ProjectCreationForm'

export default async function NewProjectPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectCreationForm />
    </div>
  )
} 