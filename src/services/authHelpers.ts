/** Comma-separated list from env */
export function parseList(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const admins = parseList(import.meta.env.VITE_ADMIN_EMAILS)
  return admins.includes(email.trim().toLowerCase())
}

/**
 * If VITE_ALLOWED_EMAIL_DOMAINS is empty, all emails pass.
 * Domains: `university.edu` matches *@university.edu; `.edu` matches any address ending in .edu
 */
export function isEmailDomainAllowed(email: string): boolean {
  const domains = parseList(import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS)
  if (domains.length === 0) return true
  const e = email.trim().toLowerCase()
  return domains.some((d) => {
    if (d.startsWith('.')) return e.endsWith(d)
    return e.endsWith(`@${d}`)
  })
}
