export function voltageToColor(v_pu?: number | null): string {
  if (v_pu === null || v_pu === undefined) return '#6B7280'
  if (v_pu >= 0.95 && v_pu <= 1.05) return '#22C55E'
  if (v_pu >= 0.90 && v_pu < 0.95) return '#EAB308'
  return '#EF4444'
}

export function voltageToStatus(v_pu?: number | null): 'normal' | 'warning' | 'critical' {
  if (v_pu === null || v_pu === undefined) return 'critical'
  if (v_pu >= 0.95 && v_pu <= 1.05) return 'normal'
  if (v_pu >= 0.90 && v_pu < 0.95) return 'warning'
  return 'critical'
}
