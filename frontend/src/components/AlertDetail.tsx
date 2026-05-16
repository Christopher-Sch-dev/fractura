import { type FC } from 'react'
import type { Alerta } from '../api/alerts'

interface AlertDetailProps {
  alerta: Alerta
  onClose: () => void
  onShowInGraph: () => void
}

const SEVERITY_COLORS: Record<string, string> = {
  high: 'var(--color-critical)',
  medium: 'var(--color-warning)',
  low: 'var(--color-primary)',
}

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

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase()
  } catch {
    return dateStr
  }
}

export const AlertDetail: FC<AlertDetailProps> = ({ alerta, onClose, onShowInGraph }) => {
  const sevColor = alerta.severidad ? SEVERITY_COLORS[alerta.severidad] ?? 'var(--color-primary)' : 'var(--color-primary)'
  const patronLabel = alerta.patron ? (PATRON_LABELS[alerta.patron] ?? alerta.patron.toUpperCase()) : null

  const fuenteLabel = alerta.fuente
    ? `FUENTE: ${alerta.fuente.toUpperCase()}`
    : 'FUENTE: —'

  return (
    <div className="alert-detail">
      <div className="alert-detail__backdrop" onClick={onClose} />

      <div className="alert-detail__panel">
        <div className="alert-detail__header">
          <span className="alert-detail__type mono-data">{alerta.tipo ?? 'ALERTA'}</span>
          <button className="alert-detail__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="alert-detail__body">
          <div className="alert-detail__severity-row">
            <span
              className="alert-detail__severity mono-data"
              style={{ color: sevColor, borderColor: sevColor }}
            >
              {alerta.severidad?.toUpperCase() ?? '—'}
            </span>
            {patronLabel && (
              <span className="alert-detail__patron mono-data">{patronLabel}</span>
            )}
          </div>

          <p className="alert-detail__mensaje">{alerta.mensaje}</p>

          {alerta.descripcion && (
            <p className="alert-detail__descripcion">{alerta.descripcion}</p>
          )}

          <div className="alert-detail__meta">
            {alerta.empresa_rut && (
              <div className="alert-detail__meta-row">
                <span className="alert-detail__meta-label">EMPRESA / RUT</span>
                <span className="alert-detail__meta-value mono-data">{alerta.empresa_rut}</span>
              </div>
            )}
            {alerta.organismo_id && (
              <div className="alert-detail__meta-row">
                <span className="alert-detail__meta-label">ORGANISMO</span>
                <span className="alert-detail__meta-value mono-data">{alerta.organismo_id}</span>
              </div>
            )}
            {alerta.monto && (
              <div className="alert-detail__meta-row">
                <span className="alert-detail__meta-label">MONTO</span>
                <span className="alert-detail__meta-value mono-data">{formatCLP(alerta.monto)}</span>
              </div>
            )}
            {alerta.fecha_deteccion && (
              <div className="alert-detail__meta-row">
                <span className="alert-detail__meta-label">FECHA DETECCIÓN</span>
                <span className="alert-detail__meta-value mono-data">{formatDate(alerta.fecha_deteccion)}</span>
              </div>
            )}
            <div className="alert-detail__meta-row">
              <span className="alert-detail__meta-label">ID</span>
              <span className="alert-detail__meta-value mono-data">{alerta.id}</span>
            </div>
            {alerta.created_at && (
              <div className="alert-detail__meta-row">
                <span className="alert-detail__meta-label">TIMESTAMP</span>
                <span className="alert-detail__meta-value mono-data">{formatDate(alerta.created_at)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="alert-detail__footer">
          <span className="alert-detail__fuente-label mono-data">{fuenteLabel}</span>
        </div>

        <div className="alert-detail__actions">
          {alerta.empresa_rut && (
            <button className="alert-detail__btn alert-detail__btn--primary" onClick={onShowInGraph}>
              VER EN GRAFO
            </button>
          )}
          <button className="alert-detail__btn alert-detail__btn--secondary" onClick={onClose}>
            CERRAR
          </button>
        </div>
      </div>

      <style>{`
        .alert-detail {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
        }
        .alert-detail__backdrop {
          position: absolute;
          inset: 0;
          background: rgba(12, 11, 9, 0.75);
          backdrop-filter: blur(2px);
        }
        .alert-detail__panel {
          position: relative;
          width: 480px;
          max-width: 95vw;
          max-height: 100vh;
          overflow-y: auto;
          background: var(--color-surface);
          border: 1px solid rgba(0, 229, 255, 0.25);
          border-right: none;
          display: flex;
          flex-direction: column;
          clip-path: polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px);
        }
        .alert-detail__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem 0.75rem;
          border-bottom: 1px solid rgba(0, 229, 255, 0.1);
        }
        .alert-detail__type {
          font-size: 0.625rem;
          letter-spacing: 0.15em;
          color: rgba(240, 240, 232, 0.4);
          text-transform: uppercase;
        }
        .alert-detail__close {
          background: none;
          border: none;
          color: rgba(240, 240, 232, 0.5);
          cursor: pointer;
          font-size: 0.875rem;
          padding: 0.25rem;
          line-height: 1;
        }
        .alert-detail__close:hover { color: var(--color-text); }
        .alert-detail__body {
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .alert-detail__severity-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .alert-detail__severity {
          font-size: 0.625rem;
          letter-spacing: 0.12em;
          border: 1px solid;
          padding: 0.2rem 0.5rem;
        }
        .alert-detail__patron {
          font-size: 0.5625rem;
          letter-spacing: 0.1em;
          color: rgba(240, 240, 232, 0.4);
          text-transform: uppercase;
          border: 1px solid rgba(0, 229, 255, 0.15);
          padding: 0.15rem 0.4rem;
        }
        .alert-detail__mensaje {
          font-family: var(--font-body);
          font-size: 0.9375rem;
          color: var(--color-text);
          line-height: 1.5;
          margin: 0;
        }
        .alert-detail__descripcion {
          font-family: var(--font-body);
          font-size: 0.8125rem;
          color: rgba(240, 240, 232, 0.6);
          line-height: 1.5;
          margin: 0;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border-left: 2px solid rgba(0, 229, 255, 0.3);
        }
        .alert-detail__meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-top: 1px solid rgba(0, 229, 255, 0.08);
          padding-top: 0.75rem;
        }
        .alert-detail__meta-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 0.5rem;
        }
        .alert-detail__meta-label {
          font-family: var(--font-heading);
          font-size: 0.5625rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(240, 240, 232, 0.35);
          flex-shrink: 0;
        }
        .alert-detail__meta-value {
          font-size: 0.75rem;
          color: var(--color-text);
          text-align: right;
          word-break: break-all;
        }
        .alert-detail__footer {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid rgba(0, 229, 255, 0.08);
          background: rgba(0, 0, 0, 0.2);
        }
        .alert-detail__fuente-label {
          font-size: 0.5625rem;
          letter-spacing: 0.15em;
          color: rgba(0, 229, 255, 0.5);
          text-transform: uppercase;
        }
        .alert-detail__actions {
          padding: 1rem 1.25rem;
          border-top: 1px solid rgba(0, 229, 255, 0.1);
          display: flex;
          gap: 0.75rem;
        }
        .alert-detail__btn {
          flex: 1;
          padding: 0.6rem 1rem;
          font-family: var(--font-heading);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid;
          clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
          transition: background 0.15s, color 0.15s;
        }
        .alert-detail__btn--primary {
          background: rgba(0, 229, 255, 0.1);
          color: var(--color-primary);
          border-color: rgba(0, 229, 255, 0.4);
        }
        .alert-detail__btn--primary:hover {
          background: rgba(0, 229, 255, 0.2);
          color: var(--color-primary);
        }
        .alert-detail__btn--secondary {
          background: transparent;
          color: rgba(240, 240, 232, 0.5);
          border-color: rgba(240, 240, 232, 0.15);
        }
        .alert-detail__btn--secondary:hover {
          color: var(--color-text);
          border-color: rgba(240, 240, 232, 0.3);
        }
      `}</style>
    </div>
  )
}