import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithElementRef<T, HTMLAttributes = any> = HTMLAttributes & {
  el?: T
}

export type WithoutChild<T> = Omit<T, 'child'>
export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>
