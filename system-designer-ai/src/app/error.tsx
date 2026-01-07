'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-[0_18px_40px_rgba(24,20,16,0.12)]">
        <div>
          <h2 className="mt-6 text-center text-3xl font-semibold text-[var(--ink)]">
            Something went wrong!
          </h2>
          <div className="mt-4 p-4 bg-rose-50 rounded-md">
            <p className="text-sm text-rose-700">{error.message}</p>
            {error.digest && (
              <p className="mt-2 text-xs text-rose-500">Error ID: {error.digest}</p>
            )}
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={reset}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)]"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex justify-center py-2 px-4 border border-[var(--border)] rounded-md shadow-sm text-sm font-medium text-[var(--ink)] bg-[var(--surface-strong)] hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)]"
          >
            Go to home page
          </button>
        </div>
      </div>
    </div>
  );
} 
