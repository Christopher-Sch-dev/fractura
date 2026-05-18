const API_BASE = (import.meta.env.VITE_API_URL as string || '').trim() || window.location.origin
function buildUrl(path: string): string { return API_BASE + path }

export interface EntityAlert {
  id: string
  tipo: string
  mensaje: string
  monto: string | number
  organismo_id: string | null
  proveedor_id: string | null
  severity: string | null
  patron: string | null
  fuente: string | null
  created_at: string | null
}

export interface EntityContract {
  id: string
  nombre: string
  monto: string | number
  fecha: string | null
  es_td: number | null
  tipo: string
  relation: string
  empresa?: string
  organismo?: string
}

export interface EntityResponse {
  id: string
  nombre: string
  tipo: string
  source: string | null
  neighbors: EntityContract[]
  alertas: EntityAlert[]
}

// Fetch all alerts and filter by nodeId (client-side workaround for backend alertas field)
async function fetchAlertsByNode(nodeId: string): Promise<EntityAlert[]> {
  const res = await fetch(buildUrl('/alerts'))
  if (!res.ok) return []
  const data = await res.json()
  const all: EntityAlert[] = data.alertas ?? []
  return all.filter(a => a.organismo_id === nodeId || a.proveedor_id === nodeId)
}

export async function fetchEntity(entityId: string): Promise<EntityResponse> {
  const [entityRes, alertas] = await Promise.all([
    fetch(buildUrl(`/entity/${encodeURIComponent(entityId)}`)),
    fetchAlertsByNode(entityId),
  ])
  if (!entityRes.ok) throw new Error(`Entity ${entityId} not found`)
  const entity = await entityRes.json()
  return { ...entity, alertas }
}
