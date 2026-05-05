import { apiFetch } from './api'
import type { NetworkCase, SolveResult } from '../types'

export const postSolve = (networkCase: NetworkCase) =>
  apiFetch<SolveResult>('/api/solve', { method: 'POST', body: JSON.stringify(networkCase) })

export const postPerturb = (req: any) =>
  apiFetch<any>('/api/perturb', { method: 'POST', body: JSON.stringify(req) })
