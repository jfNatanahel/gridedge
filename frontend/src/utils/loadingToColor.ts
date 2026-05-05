export function loadingToColor(pct?: number | null): string {
  if (pct == null) return '#6B7280'
  if (pct < 70) return '#22C55E'
  if (pct < 90) return '#F97316'
  return '#EF4444'
}

export function loadingToStatus(pct?: number | null): 'normal' | 'warning' | 'overload' {
  if (pct == null) return 'normal'
  if (pct < 70) return 'normal'
  if (pct < 90) return 'warning'
  return 'overload'
}
