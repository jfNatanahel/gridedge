export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers as any) },
    ...options,
  })
  if (!res.ok) {
    let err: any = { detail: res.statusText }
    try {
      err = await res.json()
    } catch (_) {}
    throw new Error(err.detail || 'Error de API')
  }
  return (await res.json()) as T
}
