import type { NetworkCase, CaseSummary } from "../types";

export const sampleCase: NetworkCase = {
  name: "ieee9",
  description: "Caso de ejemplo IEEE-9 (mock local, sin backend)",
  base_mva: 100,
  buses: [
    { id: 1, voltage_pu: 1.03, angle_deg: 0, p_mw: 0, q_mvar: 0, type: "Slack" },
    { id: 2, voltage_pu: 1.01, angle_deg: -1.2, p_mw: 80, q_mvar: 30, type: "PV" },
    { id: 3, voltage_pu: 0.98, angle_deg: -2.4, p_mw: -50, q_mvar: -20, type: "PQ" },
    { id: 4, voltage_pu: 0.96, angle_deg: -3.1, p_mw: -40, q_mvar: -15, type: "PQ" },
    { id: 5, voltage_pu: 0.95, angle_deg: 3.2, p_mw: -30, q_mvar: -10, type: "PQ" },
  ],
  lines: [
    { id: "L1", from: 1, to: 2, R_pu: 0.01, X_pu: 0.08, loading_pct: 32 },
    { id: "L2", from: 2, to: 3, R_pu: 0.02, X_pu: 0.09, loading_pct: 78 },
    { id: "L3", from: 3, to: 4, R_pu: 0.03, X_pu: 0.1, loading_pct: 55 },
    { id: "L4", from: 4, to: 5, R_pu: 0.02, X_pu: 0.07, loading_pct: 92 },
    { id: "L5", from: 5, to: 1, R_pu: 0.01, X_pu: 0.06, loading_pct: 12 },
  ],
};

export const sampleCase14: NetworkCase = {
  name: "ieee14",
  description: "Caso de ejemplo IEEE-14 (mock local)",
  base_mva: 100,
  buses: [
    { id: 1, voltage_pu: 1.06, angle_deg: 0, p_mw: 0, q_mvar: 0, type: "Slack" },
    { id: 2, voltage_pu: 1.045, angle_deg: -4.98, p_mw: 40, q_mvar: 12, type: "PV" },
    { id: 3, voltage_pu: 1.01, angle_deg: -12.7, p_mw: -94, q_mvar: -19, type: "PQ" },
    { id: 4, voltage_pu: 1.02, angle_deg: -10.3, p_mw: -47, q_mvar: 4, type: "PQ" },
    { id: 5, voltage_pu: 1.02, angle_deg: -8.8, p_mw: -7.6, q_mvar: -1.6, type: "PQ" },
    { id: 6, voltage_pu: 1.07, angle_deg: -14.2, p_mw: -11.2, q_mvar: -7.5, type: "PV" },
    { id: 7, voltage_pu: 1.06, angle_deg: -13.4, p_mw: 0, q_mvar: 0, type: "PQ" },
    { id: 8, voltage_pu: 1.09, angle_deg: -13.4, p_mw: 0, q_mvar: 17.4, type: "PV" },
    { id: 9, voltage_pu: 1.06, angle_deg: -14.9, p_mw: -29.5, q_mvar: -16.6, type: "PQ" },
    { id: 10, voltage_pu: 1.05, angle_deg: -15.1, p_mw: -9, q_mvar: -5.8, type: "PQ" },
    { id: 11, voltage_pu: 1.06, angle_deg: -14.8, p_mw: -3.5, q_mvar: -1.8, type: "PQ" },
    { id: 12, voltage_pu: 1.06, angle_deg: -15.1, p_mw: -6.1, q_mvar: -1.6, type: "PQ" },
    { id: 13, voltage_pu: 1.05, angle_deg: -15.2, p_mw: -13.5, q_mvar: -5.8, type: "PQ" },
    { id: 14, voltage_pu: 1.04, angle_deg: -16.0, p_mw: -14.9, q_mvar: -5.0, type: "PQ" },
  ],
  lines: [
    { id: "L1", from: 1, to: 2, R_pu: 0.019, X_pu: 0.059, loading_pct: 45 },
    { id: "L2", from: 1, to: 5, R_pu: 0.054, X_pu: 0.223, loading_pct: 38 },
    { id: "L3", from: 2, to: 3, R_pu: 0.047, X_pu: 0.198, loading_pct: 62 },
    { id: "L4", from: 2, to: 4, R_pu: 0.058, X_pu: 0.176, loading_pct: 51 },
    { id: "L5", from: 2, to: 5, R_pu: 0.057, X_pu: 0.174, loading_pct: 28 },
    { id: "L6", from: 3, to: 4, R_pu: 0.067, X_pu: 0.171, loading_pct: 71 },
    { id: "L7", from: 4, to: 5, R_pu: 0.013, X_pu: 0.042, loading_pct: 34 },
    { id: "L8", from: 4, to: 7, R_pu: 0.0, X_pu: 0.209, loading_pct: 22 },
    { id: "L9", from: 4, to: 9, R_pu: 0.0, X_pu: 0.556, loading_pct: 18 },
    { id: "L10", from: 5, to: 6, R_pu: 0.0, X_pu: 0.252, loading_pct: 41 },
    { id: "L11", from: 6, to: 11, R_pu: 0.095, X_pu: 0.199, loading_pct: 33 },
    { id: "L12", from: 6, to: 12, R_pu: 0.123, X_pu: 0.256, loading_pct: 25 },
    { id: "L13", from: 6, to: 13, R_pu: 0.066, X_pu: 0.13, loading_pct: 47 },
    { id: "L14", from: 7, to: 8, R_pu: 0.0, X_pu: 0.176, loading_pct: 19 },
    { id: "L15", from: 7, to: 9, R_pu: 0.0, X_pu: 0.11, loading_pct: 56 },
    { id: "L16", from: 9, to: 10, R_pu: 0.032, X_pu: 0.085, loading_pct: 29 },
    { id: "L17", from: 9, to: 14, R_pu: 0.127, X_pu: 0.27, loading_pct: 88 },
    { id: "L18", from: 10, to: 11, R_pu: 0.082, X_pu: 0.192, loading_pct: 21 },
    { id: "L19", from: 12, to: 13, R_pu: 0.221, X_pu: 0.2, loading_pct: 15 },
    { id: "L20", from: 13, to: 14, R_pu: 0.171, X_pu: 0.348, loading_pct: 36 },
  ],
};

export const sampleCase30: NetworkCase = {
  name: "ieee30",
  description: "Caso de ejemplo IEEE-30 (mock local, simplificado)",
  base_mva: 100,
  buses: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    voltage_pu: 1.0 + (Math.sin(i) * 0.05),
    angle_deg: -i * 1.5,
    p_mw: i === 0 ? 0 : (i % 3 === 0 ? 50 : -30),
    q_mvar: i === 0 ? 0 : (i % 2 === 0 ? 15 : -10),
    type: i === 0 ? "Slack" : (i % 4 === 0 ? "PV" : "PQ"),
  })),
  lines: Array.from({ length: 9 }, (_, i) => ({
    id: `L${i + 1}`,
    from: i + 1,
    to: i + 2,
    R_pu: 0.02,
    X_pu: 0.08,
    loading_pct: 20 + (i * 9) % 80,
  })),
};

export const sampleCaseDemo: NetworkCase = {
  name: "demo-radial",
  description: "Red radial de demostración (5 buses, 1 generador)",
  base_mva: 100,
  buses: [
    { id: 1, voltage_pu: 1.05, angle_deg: 0, p_mw: 0, q_mvar: 0, type: "Slack" },
    { id: 2, voltage_pu: 1.02, angle_deg: -2.1, p_mw: -25, q_mvar: -10, type: "PQ" },
    { id: 3, voltage_pu: 0.99, angle_deg: -4.5, p_mw: -40, q_mvar: -18, type: "PQ" },
    { id: 4, voltage_pu: 0.97, angle_deg: -5.8, p_mw: -30, q_mvar: -12, type: "PQ" },
    { id: 5, voltage_pu: 0.94, angle_deg: -7.2, p_mw: -50, q_mvar: -22, type: "PQ" },
  ],
  lines: [
    { id: "L1", from: 1, to: 2, R_pu: 0.02, X_pu: 0.06, loading_pct: 65 },
    { id: "L2", from: 2, to: 3, R_pu: 0.03, X_pu: 0.08, loading_pct: 58 },
    { id: "L3", from: 3, to: 4, R_pu: 0.04, X_pu: 0.09, loading_pct: 48 },
    { id: "L4", from: 4, to: 5, R_pu: 0.05, X_pu: 0.11, loading_pct: 95 },
  ],
};

export const sampleCases: CaseSummary[] = [
  { name: "ieee9", description: "IEEE 9-bus system (mock local)" },
  { name: "ieee14", description: "IEEE 14-bus system (mock local)" },
  { name: "ieee30", description: "IEEE 30-bus system simplificado (mock local)" },
  { name: "demo-radial", description: "Red radial de demostración 5 buses (mock local)" },
];

export const sampleCasesMap: Record<string, NetworkCase> = {
  ieee9: sampleCase,
  ieee14: sampleCase14,
  ieee30: sampleCase30,
  "demo-radial": sampleCaseDemo,
};
