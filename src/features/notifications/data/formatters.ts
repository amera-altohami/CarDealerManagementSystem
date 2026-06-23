export function formatNotificationDate(value?: string) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
