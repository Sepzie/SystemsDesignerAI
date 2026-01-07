'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/Button'

interface HeaderProps {
  isLoggedIn?: boolean
  userEmail?: string
}

export default function Header({ isLoggedIn, userEmail }: HeaderProps) {
  const router = useRouter()
  const logoHref = isLoggedIn ? '/dashboard' : '/'

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="bg-[var(--surface)] backdrop-blur border-b border-[var(--border)]">
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-3">
        <div className="text-xl font-semibold tracking-tight text-[var(--ink)]">
          <Link href={logoHref}>AI System Designer</Link>
        </div>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <span className="text-[var(--ink-muted)]">
                {userEmail}
              </span>
              <Button 
                variant="outline"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="px-4 py-2 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] shadow-[0_10px_24px_rgba(15,118,110,0.25)] transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 
