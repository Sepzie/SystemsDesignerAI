'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            className={cn(
              "appearance-none block w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
              "transition-all duration-200",
              "focus:outline-none focus-visible:border-indigo-500 focus-visible:border-2",
              error ? "border-red-300 dark:border-red-700 focus-visible:border-red-500" : "hover:border-gray-400 dark:hover:border-gray-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
