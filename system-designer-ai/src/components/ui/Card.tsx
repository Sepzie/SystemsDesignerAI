'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'elevated'
}

export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl p-6 transition-all duration-200",
        variant === 'default' && "shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700",
        variant === 'outline' && "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
        variant === 'elevated' && "shadow-lg hover:shadow-xl",
        "animate-fade-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div 
      className={cn(
        "mb-4 space-y-1.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3 
      className={cn(
        "text-xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function CardDescription({ children, className, ...props }: CardDescriptionProps) {
  return (
    <p 
      className={cn(
        "text-sm text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div 
      className={cn(
        "py-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div 
      className={cn(
        "mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
