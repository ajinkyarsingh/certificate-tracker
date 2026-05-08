export function getYear(joinYear: number) {
  const current = new Date().getFullYear()
  const diff = current - joinYear + 1

  if (diff === 1) return '1st'
  if (diff === 2) return '2nd'
  if (diff === 3) return '3rd'
  if (diff === 4) return '4th'
  return 'Alumni'
}