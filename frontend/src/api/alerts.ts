import { apiFetch } from './client'

export interface Alerta {
  id: string
  tipo: string
  mensaje: string
  monto: number | null
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
  const raw = await apiFetch<{ alertas: any[]; count: number }>('/alerts/chilecompra', params as Record<string, string | number>)
  return {
    count: raw.count,
    alertas: raw.alertas.map(a => ({
      ...a,
      severidad: a.severidad ?? a.severity ?? null,
    })),
  }
}

export async function fetchAlertById(id: string): Promise<Alerta | null> {
  try {
    return await apiFetch<Alerta>(`/alerts/${encodeURIComponent(id)}`)
  } catch {
    return null
  }
}