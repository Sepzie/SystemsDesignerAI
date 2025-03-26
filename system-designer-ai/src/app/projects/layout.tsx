import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MainLayout from '@/components/layout/MainLayout'

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout isLoggedIn={true} userEmail={session.user.email}>
      {children}
    </MainLayout>
  )
} 