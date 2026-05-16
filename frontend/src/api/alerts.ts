export interface Alerta {
  id: string
  tipo: string
  mensaje: string
  monto: number | string | null
  fecha_deteccion: string | null
  organismo_id: string | null
  proveedor_id: string | null
  empresa_rut: string | null
  descripcion: string | null
  severidad: string | null
  patron: string | null
  fuente: string | null
  created_at: string | null
}

export interface AlertsResponse {
  alertas: Alerta[]
  count: number
}

export interface AlertsParams {
  patron?: 'recurrente' | 'fraccionamiento' | 'multi-org'
  limit?: number
  fuente?: string
}

export async function fetchAlerts(params?: AlertsParams): Promise<AlertsResponse> {
  const queryParams = new URLSearchParams()
  if (params?.patron) queryParams.set('patron', params.patron)
  if (params?.limit) queryParams.set('limit', String(params.limit))
  if (params?.fuente) queryParams.set('fuente', params.fuente)
  const qs = queryParams.toString()
  const path = qs ? `/alerts?${qs}` : `/alerts`

  const res = await fetch(import.meta.env.VITE_API_URL + path)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  const raw = await res.json() as { alertas: any[] }
  return {
    count: raw.alertas.length,
    alertas: raw.alertas.map(a => ({
      ...a,
      severidad: a.severidad ?? a.severity ?? null,
    })),
  }
}

export async function fetchAlertById(id: string): Promise<Alerta | null> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/alerts/${encodeURIComponent(id)}`)
    if (!res.ok) return null
    return await res.json() as Alerta
  } catch {
    return null
  }
}

export function formatCLP(value: number | string | null): string {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (isNaN(n)) return '—'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatRUT(rut: string | null | undefined): string {
  if (!rut) return '—'
  return rut.toUpperCase()
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase()
  } catch {
    return dateStr
  }
}