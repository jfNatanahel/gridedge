import React from 'react'
import type { Line } from '../../types'
import { loadingToColor } from '../../utils/loadingToColor'

type Props = {
  line: Line
  x1: number
  y1: number
  x2: number
  y2: number
}

export default function TransmissionLine({ line, x1, y1, x2, y2 }: Props) {
  const loadingPct = (line.loading_pct ?? 0) as number
  const stroke = loadingToColor(loadingPct)

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
    </g>
  )
}
