import { useState, useEffect } from 'react'
import { fetchGraph } from '../api/graph'
import type { GraphData } from '../api/graph'

interface UseGraphOptions {
  nodeId?: string
  limit?: number
  fuente?: string
}

export function useGraph(opts: UseGraphOptions = {}) {
  const [data, setData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchGraph(opts.nodeId, opts.limit ?? 200, opts.fuente)
      .then(res => {
        if (!cancelled) {
          setData(res)
          setLoading(false)
        }
      })
      .catch(e => {
        if (!cancelled) {
          setError(e.message ?? 'Error cargando grafo')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [opts.nodeId, opts.limit, opts.fuente])

  return { graphData: data, loading, error }
}