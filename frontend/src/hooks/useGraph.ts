import { useState, useEffect, useMemo } from 'react'
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

    import('../api/graph')
      .then(({ fetchGraph }) =>
        fetchGraph(opts.nodeId, opts.limit ?? 200, opts.fuente)
      )
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

    return () => {
      cancelled = true
    }
  }, [opts.nodeId, opts.limit, opts.fuente])

  const graphData = useMemo(() => {
    if (!data) return null
    return {
      nodes: data.nodes.map(n => ({ ...n })),
      links: data.links.map(l => ({ ...l })),
    }
  }, [data])

  return { graphData, loading, error }
}