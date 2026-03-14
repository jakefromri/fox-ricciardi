import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Walk a TipTap JSON document and return plain text, truncated to `maxLength`.
 * Used to generate a preview snippet when no excerpt is available.
 */
export function extractTextFromTipTap(
  node: Record<string, unknown> | null | undefined,
  maxLength = 160
): string {
  if (!node) return ''

  function walk(n: Record<string, unknown>): string {
    if (n.type === 'text') return (n.text as string) ?? ''
    const children = (n.content as Record<string, unknown>[]) ?? []
    return children.map(walk).join(' ')
  }

  const text = walk(node).replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + '…' : text
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
