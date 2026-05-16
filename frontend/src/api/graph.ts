import { apiFetch } from './client'

export interface GraphNode {
  id: string
  label: string
  tipo: 'Organismo' | 'Empresa' | 'Contrato'
}

export interface GraphLink {
  source: string
  target: string
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export async function fetchGraph(nodeId?: string, limit = 200, fuente?: string): Promise<GraphData> {
  const params: Record<string, string | number> = { limit }
  if (nodeId) params.node_id = nodeId
  if (fuente) params.fuente = fuente
  return apiFetch<GraphData>('/graph/chilecompra', params)
}