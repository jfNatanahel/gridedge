import { apiFetch, ApiError, USE_MOCK } from "./api";

export interface BenchmarkResult {
  case: string;
  n_buses: number;
  avg_solve_us: number;
  iterations: number;
  converged: boolean;
}

const MOCK: BenchmarkResult[] = [
  { case: "ieee9", n_buses: 9, avg_solve_us: 280, iterations: 4, converged: true },
  { case: "ieee14", n_buses: 14, avg_solve_us: 420, iterations: 5, converged: true },
];

export async function getBenchmark(): Promise<BenchmarkResult[]> {
  if (USE_MOCK) return MOCK;
  try {
    return await apiFetch<BenchmarkResult[]>("/api/benchmark");
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 501)) {
      return MOCK;
    }
    throw err;
  }
}
