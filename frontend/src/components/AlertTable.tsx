import { type FC, useState, useMemo } from 'react'
import type { Alerta } from '../api/alerts'
import { formatCLP } from '../api/alerts'

interface AlertTableProps {
  alertas: Alerta[]
  loading?: boolean
  error?: string | null
  onAlertClick?: (a: Alerta) => void
}

type Filter = 'all' | 'fraccionamiento' | 'multi-org' | 'recurrente'

const TABS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'TODAS' },
  { value: 'fraccionamiento', label: 'FRACC' },
  { value: 'multi-org', label: 'MULTI' },
  { value: 'recurrente', label: 'REC' },
]

const PATRON_SHORT: Record<string, string> = {
  fraccionamiento: 'FRACC',
  'multi-org': 'MULTI',
  recurrente: 'REC',
}

const PATRON_CSS: Record<string, string> = {
  fraccionamiento: 'patron--fraccionamiento',
  'multi-org': 'patron--multi-org',
  recurrente: 'patron--recurrente',
}

const SEVERITY_CSS: Record<string, string> = {
  high: 'sev--high',
  medium: 'sev--medium',
  low: 'sev--low',
}

export const AlertTable: FC<AlertTableProps> = ({ alertas, loading, error, onAlertClick }) => {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = alertas
    if (filter !== 'all') list = list.filter(a => a.patron === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.mensaje?.toLowerCase().includes(q) ||
        a.empresa_rut?.toLowerCase().includes(q) ||
        a.fuente?.toLowerCase().includes(q)
      )
    }
    return list
  }, [alertas, filter, search])

  const countFor = (f: Filter) =>
    f === 'all' ? alertas.length : alertas.filter(a => a.patron === f).length

  return (
    <div className="alert-table">
      {/* Toolbar */}
      <div className="alert-table__toolbar">
        <div className="alert-table__tabs">
          {TABS.map(t => (
            <button
              key={t.value}
              className={`alert-table__tab ${filter === t.value ? 'active' : ''}`}
              onClick={() => setFilter(t.value)}
            >
              {t.label}
              <span className="alert-table__tab-count">{countFor(t.value)}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="FILTRAR..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="alert-table__search mono-data"
        />
      </div>

      {/* Loading / Error / Empty */}
      {loading && <div className="alert-table__msg alert-table__msg--loading">CARGANDO...</div>}
      {error && <div className="alert-table__msg alert-table__msg--error">ERROR: {error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="alert-table__msg alert-table__msg--empty">SIN ALERTAS</div>
      )}

      {/* Rows */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="alert-table__grid">
            {filtered.map(alerta => {
              const patronBadge = alerta.patron ? PATRON_SHORT[alerta.patron] ?? alerta.patron.toUpperCase() : '—'
              const patronClass = alerta.patron ? PATRON_CSS[alerta.patron] ?? '' : ''
              const sevClass = alerta.severidad ? SEVERITY_CSS[alerta.severidad] ?? '' : ''

              return (
                <div
                  key={alerta.id}
                  className="alert-row"
                  onClick={() => onAlertClick?.(alerta)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onAlertClick?.(alerta)}
                >
                  {/* Column 1: Patron + Message */}
                  <div className="alert-row__main">
                    <span className={`alert-row__badge mono-data ${patronClass}`}>{patronBadge}</span>
                    <span className="alert-row__message">{alerta.mensaje}</span>
                  </div>

                  {/* Column 2: Monto */}
                  <div className="alert-row__amount mono-data">
                    {formatCLP(alerta.monto)}
                  </div>

                  {/* Column 3: RUT */}
                  <div className="alert-row__rut mono-data">
                    {alerta.empresa_rut ?? '—'}
                  </div>

                  {/* Column 4: Severity */}
                  <div className="alert-row__sev">
                    {alerta.severidad && (
                      <span className={`alert-row__sev-badge mono-data ${sevClass}`}>
                        {alerta.severidad.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="alert-table__footer mono-data">
            MOSTRANDO {filtered.length} DE {alertas.length} — FUENTE: CHILECOMPRA 2023
          </div>
        </>
      )}
    </div>
  )
}