import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

export default function HomePage() {
  return (
    <MainLayout hideFooter={true}>
      <div className="container mx-auto px-4 min-h-[calc(100dvh-96px)] flex items-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_16px_40px_rgba(24,20,16,0.1)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent)] font-semibold mb-4">
              Systems Designer AI
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold mb-5 text-[var(--ink)]">
              Design Complex Systems with AI Assistance
            </h1>
            <p className="text-base sm:text-lg text-[var(--ink-muted)] mb-8">
              Create system diagrams, API specifications, data models, and more with AI-powered assistance.
              Collaborate with AI to design the architecture for your next project.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg text-lg font-semibold hover:bg-[var(--accent-strong)] shadow-[0_10px_24px_rgba(15,118,110,0.25)] transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-lg text-lg font-semibold text-[var(--ink)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
