'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName: name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // If we got a session (in development), we'll be automatically logged in
      if (data.session) {
        // Use replace instead of push to prevent back navigation to registration
        router.replace('/dashboard');
      } else {
        // In production, redirect to login
        router.replace('/login');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout hideFooter={true}>
      <div className="min-h-[calc(100dvh-96px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-semibold text-[var(--ink)]">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--ink-muted)]">
            Or{' '}
            <Link href="/login" className="font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]">
              sign in to your account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[var(--surface)] py-8 px-4 shadow-[0_18px_40px_rgba(24,20,16,0.12)] border border-[var(--border)] sm:rounded-2xl sm:px-10">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Full name"
              />

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Email address"
              />

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
              />

              <div>
                <Button
                  type="submit"
                  isLoading={loading}
                  fullWidth={true}
                >
                  Create account
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 
