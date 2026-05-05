import React, { useMemo, useState } from 'react'
import type { NetworkCase, Bus, Line } from '../../types'
import BusNode from './BusNode'
import TransmissionLine from './TransmissionLine'
import NodeTooltip from './NodeTooltip'
import useNetworkStore from '../../store/useNetworkStore'

type Props = {
  networkCase: NetworkCase
  onSelectBus?: (id: number | string) => void
}

export default function NetworkMap2D({ networkCase, onSelectBus }: Props) {
  const { buses = [], lines = [] } = networkCase
  const [hoveredBus, setHoveredBus] = useState<number | string | null>(null)
  const selectedBusId = useNetworkStore((s) => s.selectedBusId)
  const setSelectedBusId = useNetworkStore((s) => s.setSelectedBusId)

  const positions = useMemo(() => {
    const n = Math.max(1, buses.length)
    return buses.map((b, i) => {
      const angle = (i / n) * Math.PI * 2
      const cx = 600 + Math.cos(angle) * 280
      const cy = 400 + Math.sin(angle) * 240
      return { id: b.id, x: cx, y: cy }
    })
  }, [buses])

  const posMap = new Map(positions.map((p) => [String(p.id), p]))

  return (
    <svg viewBox="0 0 1200 800" style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg,#071025 0%, #021224 100%)' }}>
      {lines.map((ln, idx) => {
        const a = posMap.get(String(ln.from ?? ln.from_bus))
        const b = posMap.get(String(ln.to ?? ln.to_bus))
        if (!a || !b) return null
        return <TransmissionLine key={idx} line={ln as Line} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
      })}

      {positions.map((p) => {
        const bus = buses.find((b) => String(b.id) === String(p.id)) as Bus
        return (
          <g key={p.id}>
            <BusNode
              bus={bus}
              x={p.x}
              y={p.y}
              onMouseEnter={() => setHoveredBus(p.id)}
              onMouseLeave={() => setHoveredBus(null)}
              onClick={() => {
                setSelectedBusId(p.id)
                onSelectBus?.(p.id)
              }}
              isSelected={String(p.id) === String(selectedBusId)}
            />
            {hoveredBus === p.id && <NodeTooltip bus={bus} x={p.x} y={p.y} />}
          </g>
        )
      })}
    </svg>
  )
}
