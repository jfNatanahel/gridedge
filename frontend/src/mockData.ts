import type { NetworkCase } from './types'

export const sampleCase: NetworkCase = {
  name: 'ieee9',
  description: 'Caso de ejemplo IEEE-9 (mock)',
  buses: [
    { id: 1, voltage_pu: 1.03, angle_deg: 0, p_mw: 0, q_mvar: 0, type: 'Slack' },
    { id: 2, voltage_pu: 0.98, angle_deg: -2.4, p_mw: -50, q_mvar: -20, type: 'PV' },
    { id: 3, voltage_pu: 0.95, angle_deg: 3.2, p_mw: -30, q_mvar: -10, type: 'PQ' }
  ],
  lines: [
    { from: 1, to: 2, loading_pct: 32 },
    { from: 2, to: 3, loading_pct: 78 },
    { from: 3, to: 1, loading_pct: 12 }
  ]
}
