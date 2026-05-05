import { apiFetch } from './api'

export const getBenchmark = () => apiFetch('/api/benchmark')
