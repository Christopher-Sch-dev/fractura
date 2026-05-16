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
  return apiFetch<AlertsResponse>('/alerts', params as Record<string, string | number>)
}

export async function fetchAlertById(id: string): Promise<Alerta | null> {
  try {
    return await apiFetch<Alerta>(`/alerts/${encodeURIComponent(id)}`)
  } catch {
    return null
  }
}