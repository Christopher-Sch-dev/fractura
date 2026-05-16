import { type FC } from 'react'
import type { Alerta } from '../api/alerts'
import { StatusBadge } from './StatusBadge'

interface AlertCardProps {
  alerta: Alerta
  onClick?: (a: Alerta) => void
}

const PATRON_LABELS: Record<string, string> = {
  recurrente: 'PROVEEDOR ÚNICO RECURRENTE',
  fraccionamiento: 'FRACCIONAMIENTO',
  'multi-org': 'MULTI-ORG',
}

const PATRON_COLORS: Record<string, string> = {
  fraccionamiento: 'var(--color-alert)',
  recurrente: 'var(--color-accent)',
  'multi-org': 'var(--color-primary)',
}

function formatMonto(monto: number | null): string {
  if (monto == null) return '—'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto)
}

export const AlertCard: FC<AlertCardProps> = ({ alerta, onClick }) => {
  const patron = alerta.patron ?? 'unknown'
  const patronLabel = PATRON_LABELS[patron] ?? patron.toUpperCase()
  const patronColor = PATRON_COLORS[patron] ?? 'var(--color-text)'

  return (
    <article
      className="alert-card"
      onClick={() => onClick?.(alerta)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.(alerta)}
    >
      <div className="alert-card__header">
        <span
          className="alert-card__patron mono-data"
          style={{ color: patronColor }}
        >
          {patronLabel}
        </span>
        {alerta.severidad && <StatusBadge severity={alerta.severidad as any} />}
      </div>

      <p className="alert-card__mensaje">{alerta.mensaje}</p>

      <div className="alert-card__meta mono-data">
        <span className="alert-card__monto">{formatMonto(alerta.monto)}</span>
        {alerta.fuente && (
          <span className="alert-card__fuente">{alerta.fuente}</span>
        )}
      </div>

      {alerta.empresa_rut && (
        <div className="alert-card__rut mono-data">RUT: {alerta.empresa_rut}</div>
      )}

      
    </article>
  )
}