import { type FC, useState, useMemo } from 'react'
import type { Alerta } from '../api/alerts'
import type { GraphNode } from '../api/graph'

interface AlertTableProps {
  alertas: Alerta[]
  loading?: boolean
  error?: string | null
  onAlertClick?: (a: Alerta) => void
}

type PatronFilter = 'all' | 'fraccionamiento' | 'multi-org' | 'recurrente'

const PATRON_TABS: { value: PatronFilter; label: string }[] = [
  { value: 'all', label: 'TODAS' },
  { value: 'fraccionamiento', label: 'FRACCIONAMIENTO' },
  { value: 'multi-org', label: 'MULTI-ORG' },
  { value: 'recurrente', label: 'RECURRENTE' },
]

const PATRON_LABELS: Record<string, string> = {
  fraccionamiento: 'FRACCIONAMIENTO',
  'multi-org': 'MULTI-ORG',
  recurrente: 'RECURRENTE',
}

function formatCLP(monto: number | string | null): string {
  if (monto == null || monto === '') return '—'
  const n = Number(monto)
  if (isNaN(n)) return '—'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}

const SEVERITY_LABELS: Record<string, string> = {
  high: 'ALTA',
  medium: 'MEDIA',
  low: 'BAJA',
}

export const AlertTable: FC<AlertTableProps> = ({
  alertas,
  loading,
  error,
  onAlertClick,
}) => {
  const [patronFilter, setPatronFilter] = useState<PatronFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = alertas
    if (patronFilter !== 'all') {
      list = list.filter(a => a.patron === patronFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        a =>
          a.mensaje?.toLowerCase().includes(q) ||
          a.empresa_rut?.toLowerCase().includes(q) ||
          a.fuente?.toLowerCase().includes(q)
      )
    }
    return list
  }, [alertas, patronFilter, search])

  return (
    <div className="alert-table">
      <div className="alert-table__toolbar">
        <div className="alert-table__tabs">
          {PATRON_TABS.map(tab => (
            <button
              key={tab.value}
              className={`alert-table__tab ${patronFilter === tab.value ? 'active' : ''}`}
              onClick={() => setPatronFilter(tab.value)}
            >
              {tab.label}
              <span className="alert-table__tab-count">
                {tab.value === 'all'
                  ? alertas.length
                  : alertas.filter(a => a.patron === tab.value).length}
              </span>
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="FILTRAR..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="alert-table__search mono-data"
          aria-label="Filtrar alertas"
        />
      </div>

      {loading && (
        <div className="alert-table__loading">CARGANDO DATOS...</div>
      )}

      {error && (
        <div className="alert-table__error">ERROR: {error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="alert-table__grid">
            {filtered.length === 0 ? (
              <div className="alert-table__empty">SIN ALERTAS QUE COINCIDAN</div>
            ) : (
              filtered.map(alerta => {
                const patronLabel = alerta.patron ? (PATRON_LABELS[alerta.patron] ?? alerta.patron.toUpperCase()) : '—'
                return (
                  <div
                    key={alerta.id}
                    className="alert-table__row"
                    onClick={() => onAlertClick?.(alerta)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && onAlertClick?.(alerta)}
                  >
                    <div className="alert-table__cell alert-table__cell--patron">
                      <span className="alert-table__patron-badge mono-data">{patronLabel}</span>
                      <span className="alert-table__observacion">{alerta.mensaje}</span>
                    </div>
                    <div className="alert-table__cell alert-table__cell--monto mono-data">
                      {formatCLP(alerta.monto)}
                    </div>
                    <div className="alert-table__cell alert-table__cell--rut mono-data">
                      {alerta.empresa_rut ?? '—'}
                    </div>
                    <div className="alert-table__cell alert-table__cell--severity">
                      <span className={`alert-table__severity alert-table__severity--${alerta.severidad}`}>
                        {SEVERITY_LABELS[alerta.severidad ?? 'low'] ?? '—'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="alert-table__footer mono-data">
            {filtered.length} ALERTA{filtered.length !== 1 ? 'S' : ''}
            {patronFilter !== 'all' && ` (${PATRON_TABS.find(t => t.value === patronFilter)?.label})`}
          </div>
        </>
      )}

      
    </div>
  )
}