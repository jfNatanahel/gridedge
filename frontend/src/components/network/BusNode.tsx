import React from 'react'
import type { Bus } from '../../types'
import { voltageToColor } from '../../utils/voltageToColor'

type Props = {
  bus: Bus
  x: number
  y: number
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  isSelected?: boolean
}

export default function BusNode({ bus, x, y, onClick, onMouseEnter, onMouseLeave, isSelected }: Props) {
  const radius = 18
  const v = bus.voltage_pu ?? bus.V_pu ?? null
  const fill = voltageToColor(v ?? null)

  return (
    <g transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {/** outer highlight ring when selected */}
      { isSelected ? (
        <circle r={radius + 6} fill="none" stroke="#3B82F6" strokeWidth={3} opacity={0.35} />
      ) : null }
      <circle r={radius} fill={fill} stroke="#0F172A" strokeWidth={2} />
      <text x={0} y={4} textAnchor="middle" fontSize={11} fill="#041127">{bus.id}</text>
    </g>
  )
}
