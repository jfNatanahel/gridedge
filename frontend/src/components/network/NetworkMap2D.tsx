import { useMemo, useState } from "react";
import type { Bus, Line, NetworkCase } from "../../types";
import BusNode from "./BusNode";
import TransmissionLine from "./TransmissionLine";
import NodeTooltip from "./NodeTooltip";
import useNetworkStore from "../../store/useNetworkStore";

interface Props {
  networkCase: NetworkCase;
  onSelectBus?: (id: number | string) => void;
}

export default function NetworkMap2D({ networkCase, onSelectBus }: Props) {
  const { buses = [], lines = [] } = networkCase;
  const [hoveredBus, setHoveredBus] = useState<number | string | null>(null);
  const selectedBusId = useNetworkStore((s) => s.selectedBusId);
  const setSelectedBusId = useNetworkStore((s) => s.setSelectedBusId);

  const positions = useMemo(() => {
    const n = Math.max(1, buses.length);
    return buses.map((b, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const cx = 600 + Math.cos(angle) * 280;
      const cy = 400 + Math.sin(angle) * 240;
      return { id: b.id, x: cx, y: cy };
    });
  }, [buses]);

  const posMap = new Map(positions.map((p) => [String(p.id), p]));

  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full rounded-lg"
      style={{
        background:
          "radial-gradient(ellipse at center, #0b1a36 0%, #020617 70%)",
      }}
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(148,163,184,0.08)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#grid)" />

      {lines.map((ln, idx) => {
        const a = posMap.get(String(ln.from ?? ln.from_bus));
        const b = posMap.get(String(ln.to ?? ln.to_bus));
        if (!a || !b) return null;
        return (
          <TransmissionLine
            key={ln.id ?? idx}
            line={ln as Line}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
          />
        );
      })}

      {positions.map((p) => {
        const bus = buses.find((b) => String(b.id) === String(p.id)) as Bus;
        return (
          <g key={p.id}>
            <BusNode
              bus={bus}
              x={p.x}
              y={p.y}
              onMouseEnter={() => setHoveredBus(p.id)}
              onMouseLeave={() => setHoveredBus(null)}
              onClick={() => {
                setSelectedBusId(p.id);
                onSelectBus?.(p.id);
              }}
              isSelected={String(p.id) === String(selectedBusId)}
            />
            {hoveredBus === p.id && (
              <NodeTooltip bus={bus} x={p.x} y={p.y} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
