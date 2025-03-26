import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx and tailwind-merge to handle class name conflicts
 * 
 * This function:
 * 1. Uses clsx to conditionally join class names
 * 2. Uses tailwind-merge to properly merge Tailwind CSS classes
 * 3. Handles conflicts by using the last defined class
 * 
 * Example usage:
 * ```tsx
 * cn(
 *   'base-class',
 *   condition && 'conditional-class',
 *   'tailwind-classes'
 * )
 * ```
 * 
 * @param inputs - Array of class names or conditional class objects
 * @returns Merged class string with conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 