export default function Footer() {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-8">
      <div className="container mx-auto px-4 text-center text-[var(--ink-muted)]">
        <p>© {new Date().getFullYear()} AI System Designer. All rights reserved.</p>
      </div>
    </footer>
  )
} 
