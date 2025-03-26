'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  isLoggedIn?: boolean
  userEmail?: string
}

export default function Header({ isLoggedIn, userEmail }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/">AI System Designer</Link>
        </div>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <span className="text-gray-600">
                {userEmail}
              </span>
              <form action="/api/auth/signout" method="post">
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="px-4 py-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
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