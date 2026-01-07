export default function ProjectLoading() {
  return (
    <div className="h-[100dvh] bg-[var(--app-bg)] text-[var(--ink)] flex flex-col">
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-[var(--surface-muted)] animate-pulse" />
          <div className="h-6 w-56 rounded bg-[var(--surface-muted)] animate-pulse" />
          <div className="h-3 w-72 rounded bg-[var(--surface-muted)] animate-pulse" />
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="grid h-full gap-6 lg:grid-cols-[260px_minmax(0,1fr)_minmax(340px,0.9fr)]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] animate-pulse" />
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] animate-pulse" />
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
