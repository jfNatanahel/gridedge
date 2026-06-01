import type { Bus } from "../../types";
import {
  fmtVoltage,
  fmtAngleDeg,
  fmtPower,
} from "../../utils/formatters";

interface Props {
  bus: Bus;
  x: number;
  y: number;
}

export default function NodeTooltip({ bus, x, y }: Props) {
  return (
    <foreignObject x={x + 16} y={y - 30} width={220} height={130}>
      <div
        style={{
          background: "rgba(2,6,23,0.85)",
          padding: 10,
          borderRadius: 8,
          color: "#E6EEF8",
          border: "1px solid rgba(255,255,255,0.08)",
          fontFamily: "ui-sans-serif, system-ui",
        }}
      >
        <div style={{ fontWeight: 700 }}>Bus {bus.id}</div>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>{bus.type ?? "PQ"}</div>
        <div style={{ marginTop: 6, fontSize: 12 }}>
          V: {fmtVoltage(bus.voltage_pu ?? bus.V_pu)} • θ:{" "}
          {fmtAngleDeg(bus.angle_deg)}
        </div>
        <div style={{ marginTop: 4, fontSize: 12 }}>
          P: {fmtPower(bus.p_mw)} / Q: {fmtPower(bus.q_mvar)}
        </div>
      </div>
    </foreignObject>
  );
}
