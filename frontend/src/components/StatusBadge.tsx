import { type FC } from 'react'

type Severity = 'high' | 'critical' | 'medium' | 'low'

interface StatusBadgeProps {
  severity: Severity
  label?: string
}

const SEVERITY_LABELS: Record<Severity, string> = {
  high: 'ALTA',
  critical: 'CRÍTICA',
  medium: 'MEDIA',
  low: 'BAJA',
}

export const StatusBadge: FC<StatusBadgeProps> = ({ severity, label }) => {
  return (
    <span className={`badge badge--${severity}`}>
      {label ?? SEVERITY_LABELS[severity]}
    </span>
  )
}