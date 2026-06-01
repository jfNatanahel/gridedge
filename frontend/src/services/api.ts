export const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK as string | undefined) === "true";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    },
    ...options,
  });

  if (!res.ok) {
    let body: unknown = { detail: res.statusText };
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    const detail =
      (body as { detail?: string }).detail ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new ApiError(detail, res.status, body);
  }

  return (await res.json()) as T;
}
