export default function Footer() {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-8">
      <div className="container mx-auto px-4 text-center text-[var(--ink-muted)]">
        <p>© {new Date().getFullYear()} AI System Designer. All rights reserved.</p>
        <p className="mt-2 text-xs">
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
      </div>
    </footer>
  )
} 
