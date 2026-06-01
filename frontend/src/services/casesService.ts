import { apiFetch, ApiError, USE_MOCK } from "./api";
import type { CaseSummary, NetworkCase } from "../types";
import { sampleCase, sampleCases, sampleCasesMap } from "../lib/mockData";

const LS_KEY = "gridedge:cases";

function readLocalCases(): NetworkCase[] {
  if (typeof window === "undefined") return Object.values(sampleCasesMap);
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return Object.values(sampleCasesMap);
    const parsed = JSON.parse(raw) as NetworkCase[];
    if (!Array.isArray(parsed) || parsed.length === 0)
      return Object.values(sampleCasesMap);
    return parsed;
  } catch {
    return Object.values(sampleCasesMap);
  }
}

export function saveLocalCase(nc: NetworkCase) {
  if (typeof window === "undefined") return;
  const all = readLocalCases().filter((c) => c.name !== nc.name);
  all.push(nc);
  window.localStorage.setItem(LS_KEY, JSON.stringify(all));
}

function isFallbackError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return err.status === 404 || err.status === 501 || err.status === 0;
  }
  // Network error (fetch failed, backend offline, CORS, etc.)
  return err instanceof TypeError;
}

export async function getCases(): Promise<CaseSummary[]> {
  if (USE_MOCK) return sampleCases;
  try {
    return await apiFetch<CaseSummary[]>("/api/cases");
  } catch (err) {
    if (isFallbackError(err)) {
      const local = readLocalCases().map((c) => ({
        name: c.name ?? "unnamed",
        description: c.description ?? "(local)",
      }));
      // Merge built-in samples + locals (dedup by name, samples first)
      const seen = new Set<string>();
      const merged: CaseSummary[] = [];
      for (const c of [...sampleCases, ...local]) {
        if (seen.has(c.name)) continue;
        seen.add(c.name);
        merged.push(c);
      }
      return merged;
    }
    throw err;
  }
}

export async function getCase(name: string): Promise<NetworkCase> {
  if (USE_MOCK) return sampleCasesMap[name] ?? sampleCase;
  try {
    return await apiFetch<NetworkCase>(`/api/case/${encodeURIComponent(name)}`);
  } catch (err) {
    if (isFallbackError(err)) {
      if (sampleCasesMap[name]) return sampleCasesMap[name];
      const local = readLocalCases().find((c) => c.name === name);
      if (local) return local;
      return sampleCase;
    }
    throw err;
  }
}
