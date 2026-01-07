import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[0_12px_30px_rgba(24,20,16,0.08)] p-6",
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
        "mb-4",
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
        "text-xl font-semibold text-[var(--ink)]",
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
        "text-sm text-[var(--ink-muted)]",
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
        "mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 
