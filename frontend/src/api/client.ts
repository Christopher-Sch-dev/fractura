const _raw = import.meta.env.VITE_API_URL
const API_BASE = (_raw && _raw.trim()) ? _raw.trim() : ''

// When API_BASE is empty (dev without backend), resolve relative to current origin
// so /graph/chilecompra becomes http://localhost:5173/graph/chilecompra (Vite proxy)
function buildUrl(path: string, params?: Record<string, string | number>): URL {
  const base = API_BASE || window.location.origin
  const url = new URL(base + path)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }
  return url
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const res = await fetch(buildUrl(path, params).toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) {
    throw new ApiError(`HTTP ${res.status}: ${res.statusText}`, res.status)
  }

  return res.json() as Promise<T>
}