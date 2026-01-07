'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-[var(--ink-muted)] mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          className={cn(
            "appearance-none block w-full px-3 py-2 border border-[var(--border)] rounded-lg shadow-sm bg-[var(--surface-strong)] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)]",
            error && "border-red-300 focus:ring-red-500 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input } 
