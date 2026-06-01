export type VoltageStatus = "normal" | "warning" | "critical" | "unknown";

export function voltageToStatus(v_pu?: number | null): VoltageStatus {
  if (v_pu == null) return "unknown";
  if (v_pu >= 0.95 && v_pu <= 1.05) return "normal";
  if (v_pu >= 0.9 && v_pu < 0.95) return "warning";
  return "critical";
}

export function voltageToColor(v_pu?: number | null): string {
  switch (voltageToStatus(v_pu)) {
    case "normal":
      return "#22C55E";
    case "warning":
      return "#EAB308";
    case "critical":
      return "#EF4444";
    default:
      return "#6B7280";
  }
}
