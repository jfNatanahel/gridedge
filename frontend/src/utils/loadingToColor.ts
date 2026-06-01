export type LoadingStatus = "normal" | "warning" | "overload" | "unknown";

export function loadingToStatus(pct?: number | null): LoadingStatus {
  if (pct == null) return "unknown";
  if (pct < 70) return "normal";
  if (pct < 90) return "warning";
  return "overload";
}

export function loadingToColor(pct?: number | null): string {
  switch (loadingToStatus(pct)) {
    case "normal":
      return "#22C55E";
    case "warning":
      return "#F97316";
    case "overload":
      return "#EF4444";
    default:
      return "#6B7280";
  }
}
