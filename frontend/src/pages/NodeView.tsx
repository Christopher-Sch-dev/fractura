import { type FC, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { fetchEntity, type EntityResponse } from '../api/entity'

const PATRON_COLORS: Record<string, string> = {
  'multi-org': 'var(--color-alert)',
  'fraccionamiento': '#E87C0A',
  'recurrente': 'var(--color-primary)',
  'sin_patron': 'var(--text-muted)',
}

const PATRON_LABELS: Record<string, string> = {
  'multi-org': 'MULTI-ORG',
  'fraccionamiento': 'FRACCIONAM.',
  'recurrente': 'RECURRENTE',
  'sin_patron': 'SIN_PATRON',
}

const formatCLP = (v: string | number | null | undefined): string => {
  if (v == null) return '—'
  const n = typeof v === 'string' ? parseFloat(v) : v
  if (isNaN(n)) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export const NodeView: FC = () => {
  const { nodeId } = useParams<{ nodeId: string }>()
  const navigate = useNavigate()
  const [entity, setEntity] = useState<EntityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'alertas' | 'contratos'>('alertas')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (!nodeId) return
    let stale = false

    setLoading(true)
    setError(null)

    fetchEntity(nodeId)
      .then(d => {
        if (stale) return
        setEntity(d)
        setLoading(false)
      })
      .catch(() => {
        if (stale) return
        setError('Nodo no encontrado')
        setLoading(false)
      })

    return () => { stale = true }
  }, [nodeId])

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-ping mb-4 mx-auto" />
          <span className="text-[var(--text-muted)] text-[11px] font-mono tracking-[0.4em] uppercase">
            CARGANDO_NODO_{nodeId}
          </span>
        </div>
      </div>
    )
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
        <div className="text-center p-16 border border-[var(--color-alert)]/30">
          <span className="text-[var(--color-alert)] text-4xl font-black font-mono">404</span>
          <p className="text-[var(--text-muted)] mt-4 font-mono text-sm">{error}</p>
          <button onClick={() => navigate('/')} className="mt-8 text-[var(--color-primary)] text-[11px] font-black tracking-widest uppercase hover:underline">
            ← VOLVER_AL_INICIO
          </button>
        </div>
      </div>
    )
  }

  const totalMonto = entity.alertas.reduce((s, a) => s + parseFloat(String(a.monto ?? '0')), 0)
  const highAlerts = entity.alertas.filter(a => a.severity === 'high').length
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${pad(currentTime.getDate())}/${pad(currentTime.getMonth() + 1)}/${currentTime.getFullYear()}`

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex flex-col">

      {/* Top nav */}
      <nav className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-[var(--border-dim)] backdrop-blur-3xl bg-[var(--bg-deep)]/80 sticky top-0 z-50">
        <button onClick={() => navigate('/')} className="flex items-center gap-4 group">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden md:flex flex-col border-l border-[var(--border-dim)] pl-12 h-10 justify-center">
              <span className="text-[9px] text-[var(--text-muted)] font-black tracking-[0.4em] uppercase mb-0.5">NODO_SELECCIONADO</span>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-pulse" />
                <span className="text-[9px] text-[var(--color-primary)] font-black tracking-[0.1em] uppercase">ID: {entity.id}</span>
              </div>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-6">
          <div className="text-[11px] font-black text-[var(--text-muted)] tracking-[0.2em] uppercase">
            <div className="flex items-center gap-4 py-3 px-6 border border-[var(--border-dim)]">
              <span className="text-[12px] text-[var(--text-main)] font-black tracking-widest">{dateStr}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-4 bg-transparent text-[var(--text-main)] px-8 h-12 text-[10px] font-black tracking-[0.4em] uppercase group overflow-hidden relative border border-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-10)] transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[var(--color-primary)] opacity-60" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[var(--color-primary)] opacity-60" />
            <span className="relative z-10 group-hover:text-[var(--color-primary)] transition-colors">← VOLVER</span>
          </button>
        </div>
      </nav>

      {/* Hero: entity name + stats */}
      <div className="border-b border-[var(--border-dim)] bg-[var(--bg-panel)]/60 backdrop-blur-md px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[9px] font-black text-[var(--color-primary)] tracking-[0.3em] uppercase">
              {entity.tipo.toUpperCase()}
            </span>
            <div className="w-16 h-px bg-[var(--border-dim)]" />
            <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-wider">{entity.id}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic mb-8 text-[var(--text-main)] leading-tight">
            {entity.nombre}
          </h1>
          <div className="flex flex-wrap gap-8">
            {[
              { label: formatCLP(totalMonto), sub: 'MONTO TOTAL', color: 'var(--color-primary)' },
              { label: `${entity.alertas.length}`, sub: 'ALERTAS', color: entity.alertas.length > 0 ? 'var(--color-alert)' : 'var(--text-muted)' },
              { label: `${highAlerts}`, sub: 'CRITICAL', color: highAlerts > 0 ? 'var(--color-alert)' : 'var(--text-muted)' },
              { label: `${entity.neighbors.length}`, sub: 'CONTRATOS', color: 'var(--text-main)' },
            ].map(({ label, sub, color }) => (
              <div key={sub} className="border border-[var(--border-dim)] p-6 bg-[var(--bg-deep)]/60 min-w-[140px]">
                <p className="text-2xl font-black font-mono text-[var(--text-main)]">{label}</p>
                <p className="text-[9px] font-black tracking-[0.3em] uppercase mt-1" style={{ color }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="border-b border-[var(--border-dim)] px-8 bg-[var(--bg-deep)]">
        <div className="max-w-7xl mx-auto flex gap-0">
          {(['alertas', 'contratos'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-6 text-[10px] font-black tracking-[0.4em] uppercase transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {tab === 'alertas' ? `ALERTAS (${entity.alertas.length})` : `CONTRATOS (${entity.neighbors.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-8 max-w-7xl mx-auto w-full">

        {activeTab === 'alertas' && (
          <div className="space-y-4">
            {entity.alertas.length === 0 ? (
              <div className="border border-[var(--border-dim)] p-12 text-center">
                <span className="text-[var(--text-muted)] font-mono text-sm uppercase tracking-widest">Sin alertas para este nodo</span>
              </div>
            ) : (
              entity.alertas.map(alert => {
                const pColor = PATRON_COLORS[alert.patron ?? ''] ?? 'var(--text-muted)'
                const pLabel = PATRON_LABELS[alert.patron ?? ''] ?? alert.patron?.toUpperCase() ?? '—'
                return (
                  <div key={alert.id} className="border border-[var(--border-dim)] bg-[var(--bg-panel)]/80 p-8 hover:border-[var(--color-primary-40)] transition-colors">
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-4 flex-wrap">
                          {alert.severity === 'high' && (
                            <span className="px-2 py-1 bg-[var(--color-alert)] text-white text-[9px] font-black tracking-widest uppercase">CRITICAL</span>
                          )}
                          <span className="text-lg font-black uppercase tracking-tight text-[var(--text-main)]">{alert.tipo?.toUpperCase()}</span>
                          <span className="text-[9px] font-black tracking-widest uppercase px-3 py-1 border" style={{ borderColor: pColor, color: pColor }}>{pLabel}</span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">{alert.mensaje}</p>
                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-mono text-[var(--text-muted)]">
                          {alert.organismo_id && <span>RUT_ORG: <span className="text-[var(--text-main)]">{alert.organismo_id}</span></span>}
                          {alert.proveedor_id && <span>RUT_PROV: <span className="text-[var(--text-main)]">{alert.proveedor_id}</span></span>}
                          <span>FUENTE: <span className="text-[var(--text-main)]">{alert.fuente ?? '—'}</span></span>
                          {alert.created_at && <span>FECHA: <span className="text-[var(--text-main)]">{alert.created_at.slice(0, 10)}</span></span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black font-mono text-[var(--color-primary)]">{formatCLP(alert.monto)}</p>
                        <p className="text-[9px] text-[var(--text-muted)] font-black tracking-widest uppercase mt-1">MONTO</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'contratos' && (
          <div className="space-y-4">
            {entity.neighbors.length === 0 ? (
              <div className="border border-[var(--border-dim)] p-12 text-center">
                <span className="text-[var(--text-muted)] font-mono text-sm uppercase tracking-widest">Sin contratos registrados</span>
              </div>
            ) : (
              entity.neighbors.map((c, i) => (
                <div key={`${c.id}-${i}`} className="border border-[var(--border-dim)] bg-[var(--bg-panel)]/80 p-8 hover:border-[var(--color-primary-40)] transition-colors">
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-[9px] font-black text-[var(--color-primary)] tracking-widest uppercase">{c.relation?.toUpperCase()}</span>
                        {c.es_td === 1 && <span className="text-[9px] font-black text-[var(--text-muted)] tracking-widest uppercase border border-[var(--border-dim)] px-2 py-0.5">TRATO_DIRECTO</span>}
                      </div>
                      <p className="text-[var(--text-main)] font-mono text-sm mb-2">{c.nombre}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10px] font-mono text-[var(--text-muted)]">
                        {c.empresa && <span>EMPRESA: <span className="text-[var(--text-main)]">{c.empresa}</span></span>}
                        {c.organismo && <span>ORGANISMO: <span className="text-[var(--text-main)]">{c.organismo}</span></span>}
                        {c.tipo && <span>TIPO: <span className="text-[var(--text-main)]">{c.tipo}</span></span>}
                        {c.fecha && <span>FECHA: <span className="text-[var(--text-main)]">{c.fecha}</span></span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black font-mono text-[var(--text-bright)]">{formatCLP(c.monto)}</p>
                      <p className="text-[9px] text-[var(--text-muted)] font-black tracking-widest uppercase mt-1">MONTO</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}