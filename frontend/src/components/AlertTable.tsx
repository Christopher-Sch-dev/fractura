import { type FC, useState, useMemo } from 'react'
import type { Alerta } from '../api/alerts'
import { AlertCard } from './AlertCard'

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
        <div className="alert-table__loading">
          CARGANDO DATOS...
        </div>
      )}

      {error && (
        <div className="alert-table__error">
          ERROR: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="alert-table__grid">
          {filtered.length === 0 ? (
            <div className="alert-table__empty">SIN ALERTAS QUE COINCIDAN</div>
          ) : (
            filtered.map(alerta => (
              <AlertCard
                key={alerta.id}
                alerta={alerta}
                onClick={onAlertClick}
              />
            ))
          )}
        </div>
      )}

      {!loading && (
        <div className="alert-table__footer mono-data">
          {filtered.length} ALERTA{filtered.length !== 1 ? 'S' : ''}
          {patronFilter !== 'all' && ` (${PATRON_TABS.find(t => t.value === patronFilter)?.label})`}
        </div>
      )}

      <style>{`
        .alert-table {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .alert-table__toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
          justify-content: space-between;
        }
        .alert-table__tabs {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        .alert-table__tab {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          font-family: var(--font-heading);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: rgba(240, 240, 232, 0.5);
          border: 1px solid rgba(0, 229, 255, 0.15);
          background: transparent;
          cursor: pointer;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .alert-table__tab:hover {
          color: var(--color-text);
          border-color: rgba(0, 229, 255, 0.35);
        }
        .alert-table__tab.active {
          color: var(--color-primary);
          border-color: rgba(0, 229, 255, 0.6);
          background: rgba(0, 229, 255, 0.06);
        }
        .alert-table__tab-count {
          background: rgba(0, 229, 255, 0.15);
          padding: 0.05rem 0.35rem;
          font-size: 0.625rem;
          border-radius: 0;
        }
        .alert-table__search {
          background: rgba(12, 11, 9, 0.6);
          border: 1px solid rgba(0, 229, 255, 0.2);
          color: var(--color-text);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          padding: 0.4rem 0.75rem;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
          width: 220px;
        }
        .alert-table__search::placeholder {
          color: rgba(240, 240, 232, 0.3);
          text-transform: uppercase;
          font-size: 0.6875rem;
          letter-spacing: 0.05em;
        }
        .alert-table__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 0.75rem;
        }
        .alert-table__loading,
        .alert-table__error {
          padding: 2rem;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: rgba(240, 240, 232, 0.5);
          border: 1px dashed rgba(0, 229, 255, 0.2);
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
        }
        .alert-table__error {
          color: var(--color-alert);
          border-color: rgba(255, 26, 26, 0.3);
        }
        .alert-table__empty {
          padding: 2rem;
          text-align: center;
          font-family: var(--font-heading);
          font-size: 0.875rem;
          letter-spacing: 0.1em;
          color: rgba(240, 240, 232, 0.3);
        }
        .alert-table__footer {
          font-size: 0.6875rem;
          color: rgba(240, 240, 232, 0.35);
          text-align: right;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(0, 229, 255, 0.08);
        }
      `}</style>
    </div>
  )
}