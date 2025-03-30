'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow',
        secondary: 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
        ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        link: 'text-indigo-600 underline-offset-4 hover:underline',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 py-1 text-xs rounded-sm',
        lg: 'h-12 px-6 py-3 text-base rounded-lg',
        icon: 'h-9 w-9 p-0 rounded-full',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2">
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
