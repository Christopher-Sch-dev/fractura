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

// Extract RUT from alert ID to match by RUT when organismo_id/proveedor_id is null
function rutFromAlertId(alertId: string): string | null {
  // p2_{organismo}_{proveedor}_{fuente} -> return null (has explicit org+prov)
  // p3_{rut}_{fuente} -> return rut (it's the proveedor RUT)
  const parts = alertId.split('_')
  if (parts[0] === 'p3' && parts.length >= 2) {
    return parts[1]
  }
  return null
}

// Match alert to node by RUT (organismo_id, proveedor_id, or extracted from ID)
function alertMatchesNode(alert: EntityAlert, nodeId: string): boolean {
  if (alert.organismo_id === nodeId) return true
  if (alert.proveedor_id === nodeId) return true
  const extractedRut = rutFromAlertId(alert.id)
  if (extractedRut === nodeId) return true
  return false
}

async function fetchAlertsByNode(nodeId: string): Promise<EntityAlert[]> {
  const res = await fetch(buildUrl('/alerts'))
  if (!res.ok) return []
  const data = await res.json()
  const all: EntityAlert[] = data.alertas ?? []
  return all.filter(a => alertMatchesNode(a, nodeId))
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
