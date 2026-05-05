import React from 'react'
import type { Bus } from '../../types'
import { fmtVoltage, fmtAngle, fmtPower } from '../../utils/formatters'

type Props = {
  bus: Bus
  x: number
  y: number
}

export default function NodeTooltip({ bus, x, y }: Props) {
  return (
    <foreignObject x={x + 12} y={y - 24} width={220} height={120}>
      <div style={{ background: 'rgba(2,6,23,0.6)', padding: 8, borderRadius: 6, color: '#E6EEF8' }}>
        <div style={{ fontWeight: 700 }}>{bus.id}</div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>{bus.type || 'PQ'}</div>
        <div style={{ marginTop: 6 }}>
          V: {fmtVoltage(bus.voltage_pu ?? bus.V_pu)} • θ: {fmtAngle(bus.angle_deg ?? bus.angle_rad)}
        </div>
        <div style={{ marginTop: 6 }}>
          P: {fmtPower(bus.p_mw ?? bus.P_load_pu)} / Q: {fmtPower(bus.q_mvar ?? bus.Q_load_pu)}
        </div>
      </div>
    </foreignObject>
  )
}
