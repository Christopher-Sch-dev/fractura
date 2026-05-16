import { useState, useEffect, useCallback } from 'react'
import { fetchAlerts } from '../api/alerts'
import type { Alerta } from '../api/alerts'

interface UseAlertsOptions {
  patron?: string
  limit?: number
  fuente?: string
}

interface UseAlertsReturn {
  alertas: Alerta[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAlerts(opts: UseAlertsOptions = {}): UseAlertsReturn {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAlerts({
        patron: opts.patron as any,
        limit: opts.limit,
        fuente: opts.fuente,
      })
      setAlertas(res.alertas)
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [opts.patron, opts.limit, opts.fuente])

  useEffect(() => {
    fetch_()
  }, [fetch_])

  return { alertas, loading, error, refetch: fetch_ }
}