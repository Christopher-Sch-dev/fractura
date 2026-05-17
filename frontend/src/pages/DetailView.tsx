import { type FC, useState, useEffect } from 'react'
import Logo from '../components/Logo'
import type { Alerta } from '../api/alerts'
import { fetchAlerts } from '../api/alerts'

interface DetailViewProps {
  onBack: () => void
  initialNodeId?: string | null
}

export const DetailView: FC<DetailViewProps> = ({ onBack, initialNodeId }) => {
  const [alerts, setAlerts] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<Alerta | null>(null)
  const [alertDetailModal, setAlertDetailModal] = useState<Alerta | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [patronFilter, setPatronFilter] = useState<string>('todas')
  const [currentTime, setCurrentTime] = useState(new Date())

  const PATRON_OPTIONS = ['todas', 'multi-org', 'fraccionamiento', 'recurrente', 'sin_patron']

  useEffect(() => {
    if (initialNodeId && alerts.length > 0) {
      const match = alerts.find(a =>
        a.organismo_id === initialNodeId ||
        a.proveedor_id === initialNodeId
      )
      if (match) setSelectedAlert(match)
    }
  }, [initialNodeId, alerts.length])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchAlerts({ limit: 200 })
      .then(d => { setAlerts(d.alertas ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = alerts.filter(a => {
    const matchSearch = searchQuery === '' ||
      (a.mensaje?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (a.id.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
    const matchPatron = patronFilter === 'todas' ||
      (patronFilter === 'sin_patron' ? a.patron == null : a.patron === patronFilter)
    return matchSearch && matchPatron
  })

  const formatCLP = (v: number | string | null | undefined) => {
    if (v == null) return '—'
    const n = parseFloat(String(v))
    if (isNaN(n)) return '—'
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
    return `$${n.toLocaleString('es-CL')}`
  }

  const extractRut = (alertId: string) => {
    const parts = alertId.split('_')
    return parts.length >= 2 ? parts[1] : alertId
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${pad(currentTime.getDate())}/${pad(currentTime.getMonth() + 1)}/${currentTime.getFullYear()}`

  const totalMonto = alerts.reduce((s, a) => s + parseFloat(String(a.monto ?? '0')), 0)
  const highCount = alerts.filter(a => a.severidad === 'high').length

  return (
    <div className="h-screen flex flex-col font-sans bg-[var(--bg-deep)] relative overflow-hidden">

      {/* Fixed overlays (CSS effects only - Background3D lives in App.tsx) */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="system-scan" />
        <div className="fixed inset-0 spiderweb-grid" />
        <div className="fixed inset-0 noise-overlay" />
      </div>

      {/* Header */}
      <header className="h-24 px-6 md:px-12 flex items-center justify-between border-b border-[var(--border-dim)] backdrop-blur-3xl sticky top-0 z-50 bg-[var(--bg-deep)]/70">
        <div className="flex items-center gap-12">
          <Logo />
          <button
            onClick={onBack}
            className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-all"
          >
            <div className="w-10 h-10 border border-[var(--border-dim)] flex items-center justify-center group-hover:border-[var(--color-primary-40)] group-hover:rotate-[-90deg] transition-all">
              ←
            </div>
            VOLVER AL PANEL
          </button>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-[var(--text-muted)] tracking-[0.2em] uppercase font-bold opacity-60">CONTRATACIONES PÚBLICAS</span>
            <span className="text-[9px] text-[var(--color-primary)] tracking-[0.2em] uppercase font-black">REGIÓN METROPOLITANA</span>
          </div>
          <div className="w-px h-10 bg-[var(--border-dim)]" />
          <div className="flex items-center gap-6 text-[11px] font-black text-[var(--text-muted)] tracking-[0.2em] uppercase">
            <div className="flex items-center gap-3 py-3 px-6 border border-[var(--border-dim)]">
              <span className="text-[12px] text-[var(--text-main)] font-black tracking-widest">{dateStr}</span>
            </div>
            <div className="flex items-center gap-3 py-3 px-6 bg-[var(--color-primary-10)] border border-[var(--color-primary-20)]">
              <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse" />
              <span className="text-[var(--color-primary)] text-[11px] font-black uppercase tracking-widest">CONEXIÓN_ESTABLE_SEC_L5</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="flex-1 grid grid-cols-12 overflow-hidden" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>

        {/* Left: Alert table — 7 cols */}
        <div className="col-span-12 lg:col-span-7 flex flex-col border-r border-[var(--border-dim)] bg-[var(--bg-panel)]/90 backdrop-blur-md overflow-hidden">
          {/* Search bar + patron filter */}
          <div className="p-6 border-b border-[var(--border-dim)]">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[var(--text-muted)]">BUSCAR</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="RUT, organismo, empresa..."
                className="flex-1 bg-[var(--bg-deep)] border border-[var(--color-primary-20)] text-[var(--text-main)] font-mono text-sm px-4 py-3 focus:border-[var(--color-primary)] outline-none transition-colors"
              />
              <select
                value={patronFilter}
                onChange={e => setPatronFilter(e.target.value)}
                className="bg-[var(--bg-panel)] border border-[var(--color-primary-30)] text-[var(--color-primary)] font-mono text-[11px] px-4 py-[10px] focus:border-[var(--color-primary)] outline-none cursor-pointer tracking-widest uppercase"
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
              >
                {PATRON_OPTIONS.map(p => (
                  <option key={p} value={p} style={{ background: 'var(--bg-deep)', color: 'var(--text-main)' }}>{p === 'todas' ? 'TODOS' : p.toUpperCase()}</option>
                ))}
              </select>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                {filtered.length} resultados
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-dim)] uppercase tracking-[0.4em] text-[10px] text-[var(--text-muted)] font-bold bg-[var(--bg-panel)] sticky top-0 z-20">
                  <th className="px-10 py-8 font-bold">IDENTIFICADOR_RED</th>
                  <th className="px-10 py-8 font-bold text-right w-64">VALOR_ESTIMADO</th>
                  <th className="px-10 py-8 font-bold text-right w-56">RUT_ENTIDAD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-dim)]">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-10 py-12 text-center text-[var(--text-muted)] font-mono text-sm tracking-widest uppercase">
                      Cargando alertas...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-10 py-12 text-center text-[var(--text-muted)] font-mono text-sm tracking-widest uppercase">
                      Sin resultados
                    </td>
                  </tr>
                ) : (
                  filtered.map((alert) => {
                    const isSelected = selectedAlert?.id === alert.id
                    const isHigh = alert.severidad === 'high'
                    return (
                      <tr
                        key={alert.id}
                        onClick={() => setSelectedAlert(isSelected ? null : alert)}
                        className={`cursor-pointer transition-all duration-300 border-l-[3px] ${
                          isSelected
                            ? 'border-l-[var(--color-alert)] bg-[rgba(255,42,42,0.05)]'
                            : 'border-l-transparent hover:border-l-[var(--color-primary-40)] hover:bg-[rgba(0,229,255,0.03)]'
                        }`}
                      >
                        <td className="px-10 py-10">
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              {isHigh && (
                                <span className="px-2 py-1 bg-[var(--color-alert)] text-white text-[9px] font-black tracking-widest uppercase">
                                  CRITICAL
                                </span>
                              )}
                              <span className={`text-lg font-black uppercase tracking-tight ${isSelected ? 'text-[var(--color-alert)]' : 'text-[var(--text-main)]'} hover:text-[var(--color-primary)] transition-colors`}>
                                {alert.tipo?.toUpperCase() ?? 'ALERTA'}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md">
                              {alert.mensaje}
                            </p>
                          </div>
                        </td>
                        <td className="px-10 py-10 text-right">
                          <span className="text-xl font-black font-mono text-[var(--text-bright)]">
                            {formatCLP(alert.monto)}
                          </span>
                        </td>
                        <td className="px-10 py-10 text-right">
                          <span className="text-sm font-mono text-[var(--text-muted)] font-variant-numeric tabular-nums">
                            {extractRut(alert.id)}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Stats panel — 5 cols */}
        <div className="col-span-12 lg:col-span-5 p-6 bg-[var(--bg-panel)]/40 backdrop-blur-3xl overflow-y-auto flex flex-col" style={{ minHeight: 0 }}>
          <h3 className="text-[11px] font-black tracking-[0.5em] uppercase text-[var(--text-muted)] mb-10 pb-6 border-b border-[var(--border-dim)]">
            RESUMEN_DETECCIÓN
          </h3>

          {/* Summary stats */}
          <div className="flex-1 overflow-y-auto space-y-6">
            <div className="border border-[var(--border-dim)] p-6">
              <p className="text-[9px] text-[var(--text-muted)] font-black tracking-[0.3em] uppercase mb-2">TOTAL ALERTAS</p>
              <p className="text-2xl font-black text-[var(--text-main)] font-mono">{alerts.length}</p>
            </div>
            <div className="border border-[var(--color-alert)]/40 p-6 bg-[rgba(255,42,42,0.05)]">
              <p className="text-[9px] text-[var(--color-alert)] font-black tracking-[0.3em] uppercase mb-2">CRITICAL / HIGH</p>
              <p className="text-2xl font-black text-[var(--color-alert)] font-mono">{highCount}</p>
            </div>
            <div className="border border-[var(--border-dim)] p-6">
              <p className="text-[9px] text-[var(--text-muted)] font-black tracking-[0.3em] uppercase mb-2">MONTO TOTAL OBSERVADO</p>
              <p className="text-xl font-black text-[var(--color-primary)] font-mono">
                ${(totalMonto / 1_000_000_000).toFixed(1)}B
              </p>
            </div>
          </div>

          {selectedAlert && (
            <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-alert)]/20 bg-[rgba(255,42,42,0.03)]">
              <span className="w-2 h-2 bg-[var(--color-alert)] rounded-full animate-pulse" />
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                {selectedAlert.tipo?.toUpperCase()} — {formatCLP(selectedAlert.monto)}
              </span>
              <button
                onClick={() => setAlertDetailModal(selectedAlert)}
                className="ml-2 text-[9px] font-black text-[var(--color-primary)] hover:text-[var(--color-primary-60)] tracking-widest uppercase transition-colors border border-[var(--color-primary-30)] px-3 py-1"
              >
                VER_DETALLE →
              </button>
            </div>
          )}
        </div>
          {/* Modal overlay for alert detail */}
          {alertDetailModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.85)' }}
              onClick={() => setAlertDetailModal(null)}
            >
              <div
                className="relative w-full max-w-2xl border border-[var(--color-primary)] bg-[var(--bg-deep)] shadow-2xl shadow-[var(--color-primary-20)] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--color-primary-30)]">
                  <span className="text-[10px] font-black text-[var(--color-primary)] tracking-[0.4em] uppercase">ALERTA_DETALLE</span>
                  <button
                    onClick={() => setAlertDetailModal(null)}
                    className="text-[var(--text-muted)] hover:text-[var(--color-primary)] font-mono text-[11px] font-black tracking-widest uppercase transition-colors"
                  >
                    [CERRAR_X]
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  {[
                    { label: 'TIPO', value: alertDetailModal.tipo?.toUpperCase(), className: 'text-[var(--color-alert)]' },
                    { label: 'PATRÓN', value: alertDetailModal.patron?.toUpperCase() ?? '—' },
                    { label: 'FUENTE', value: alertDetailModal.fuente ?? '—' },
                    { label: 'SEVERIDAD', value: alertDetailModal.severidad?.toUpperCase(), className: 'text-[var(--color-alert)]' },
                    { label: 'MONTO', value: formatCLP(alertDetailModal.monto), className: 'text-2xl font-black text-[var(--color-primary)] font-mono' },
                    { label: 'ID', value: alertDetailModal.id, className: 'font-mono text-[var(--text-muted)] break-all' },
                  ].map(({ label, value, className }) => (
                    <div key={label} className="flex items-baseline gap-6 border-b border-[var(--border-dim)] pb-4">
                      <p className="text-[9px] text-[var(--text-muted)] font-black tracking-[0.3em] uppercase w-40 flex-shrink-0">{label}</p>
                      <p className={`text-sm font-black text-[var(--text-main)] uppercase ${className ?? ''}`}>{value ?? '—'}</p>
                    </div>
                  ))}
                  {alertDetailModal.mensaje && (
                    <div className="border-t border-[var(--border-dim)] pt-5">
                      <p className="text-[9px] text-[var(--text-muted)] font-black tracking-[0.3em] uppercase mb-3">MENSAJE</p>
                      <p className="text-sm text-[var(--text-main)] leading-relaxed font-mono">{alertDetailModal.mensaje}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

      </main>
    </div>
  )
}