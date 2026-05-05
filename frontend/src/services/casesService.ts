import { apiFetch } from './api'
import type { NetworkCase } from '../types'

export const getCases = () => apiFetch<Array<{ name: string; description: string }>>('/api/cases')
export const getCase = (name: string) => apiFetch<NetworkCase>(`/api/case/${name}`)
