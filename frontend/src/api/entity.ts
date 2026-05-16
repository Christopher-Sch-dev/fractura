import { apiFetch } from './client'

export interface Entity {
  id: string
  nombre: string
  tipo: string
  source?: string
  neighbors: Array<{
    id: string
    nombre: string
    relation: string
    monto?: string
  }>
}

export async function fetchEntity(id: string): Promise<Entity> {
  return apiFetch<Entity>(`/entity/${encodeURIComponent(id)}`)
}