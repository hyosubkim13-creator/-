// datetime-local input needs "YYYY-MM-DDTHH:mm" in local time (no timezone).
export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function nowLocalInputValue(): string {
  return toLocalInputValue(new Date())
}

export function formatDisplayDateTime(isoLike: string): string {
  const d = new Date(isoLike)
  if (Number.isNaN(d.getTime())) return isoLike
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDisplayDate(isoLike: string): string {
  const d = new Date(isoLike)
  if (Number.isNaN(d.getTime())) return isoLike
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
