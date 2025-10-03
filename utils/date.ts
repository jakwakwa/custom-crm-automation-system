/**
 * Date formatting utilities for consistent server/client rendering
 * 
 * Using toLocaleDateString() can cause hydration mismatches because:
 * - Server renders with one timezone/locale
 * - Client renders with a different timezone/locale
 * 
 * These utilities format dates consistently to prevent hydration errors.
 */

/**
 * Format a date as YYYY-MM-DD (ISO date format without time)
 * This is consistent across server and client rendering
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format a date as "Jan 15, 2024" (more readable)
 * Still consistent across server/client
 */
export function formatDateReadable(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getMonth()]
  const day = d.getDate()
  const year = d.getFullYear()
  return `${month} ${day}, ${year}`
}

/**
 * Format a date as "15 Jan 2024" (alternative readable format)
 */
export function formatDateReadableAlt(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getMonth()]
  const day = d.getDate()
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}
