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

      
    </div>
  )
}