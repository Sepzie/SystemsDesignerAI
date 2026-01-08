import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

export default function HomePage() {
  return (
    <MainLayout hideFooter={true}>
      <div className="container mx-auto px-4 flex-1 flex items-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_16px_40px_rgba(24,20,16,0.1)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent)] font-semibold mb-4">
              Systems Designer AI
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold mb-5 text-[var(--ink)]">
              System design chat with persistent assets
            </h1>
            <p className="text-base sm:text-lg text-[var(--ink-muted)] mb-8">
              This is a system design copilot: chat with an AI that creates and remembers diagrams, specs, and documents
              inside each project so you can plan architecture and keep assets organized over time.
            </p>
            <p className="text-sm text-[var(--ink-muted)] mb-8">
              This is a demo project by Sepehr Zohoori Rad ·{' '}
              <a
                href="https://github.com/Sepzie/SystemsDesignerAI"
                className="text-[var(--accent)] hover:text-[var(--accent-strong)] underline"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
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
