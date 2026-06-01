export const fmtVoltage = (v?: number | null) =>
  v != null ? `${v.toFixed(3)} pu` : "—";

export const fmtAngle = (rad?: number | null) =>
  rad != null ? `${((rad * 180) / Math.PI).toFixed(2)}°` : "—";

export const fmtAngleDeg = (deg?: number | null) =>
  deg != null ? `${deg.toFixed(2)}°` : "—";

export const fmtPower = (mw?: number | null) =>
  mw != null ? `${mw.toFixed(1)} MW` : "—";

export const fmtTime = (us?: number | null) =>
  us != null ? `${us.toFixed(0)} µs` : "—";

export const fmtError = (e?: number | null) =>
  e != null ? e.toExponential(2) : "—";

export const fmtLoading = (pct?: number | null) =>
  pct != null ? `${pct.toFixed(1)}%` : "—";
