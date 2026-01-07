import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

export default function HomePage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 shadow-[0_18px_50px_rgba(24,20,16,0.1)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent)] font-semibold mb-4">
              Systems Designer AI
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold mb-6 text-[var(--ink)]">
              Design Complex Systems with AI Assistance
            </h1>
            <p className="text-lg text-[var(--ink-muted)] mb-10">
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

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'System Diagrams',
              body: 'Generate comprehensive system architecture diagrams showing components, interactions, and data flows.',
            },
            {
              title: 'API Specifications',
              body: 'Create detailed API specifications including endpoints, request/response formats, and authentication methods.',
            },
            {
              title: 'Data Models',
              body: 'Design database schemas and data models with entity relationships, fields, and constraints.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_12px_30px_rgba(24,20,16,0.08)]"
            >
              <h2 className="text-xl font-semibold mb-3 text-[var(--ink)]">{item.title}</h2>
              <p className="text-[var(--ink-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
