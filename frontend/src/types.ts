// Shared frontend types for GridEdge
export type SystemStatus = 'idle' | 'stable' | 'warning' | 'critical' | 'error'

export interface Bus {
  id: number | string
  name?: string
  type?: string
  V_pu?: number | null
  voltage_pu?: number | null
  angle_rad?: number | null
  angle_deg?: number | null
  p_mw?: number | null
  q_mvar?: number | null
  P_load_pu?: number | null
  Q_load_pu?: number | null
  lat?: number
  lon?: number
}

export interface Line {
  id?: number | string
  from?: number | string
  to?: number | string
  from_bus?: number | string
  to_bus?: number | string
  R_pu?: number
  X_pu?: number
  B_pu?: number
  loading_pct?: number
  capacity_pu?: number
}

export interface NetworkCase {
  name?: string
  description?: string
  base_mva?: number
  buses: Bus[]
  lines: Line[]
}

export interface SolveResult {
  rc: number
  converged: boolean
  iterations: number
  max_error_pu: number
  solve_time_us: number
  n_buses: number
  V_pu: number[]
  theta_rad: number[]
  conv_iters: number[]
  conv_errors: number[]
  [key: string]: any
}
