import { type FC, useState, useEffect } from 'react'
import { GlobeGraph } from '../components/GlobeGraph'
import { StatItem } from '../components/StatItem'
import Logo from '../components/Logo'
import type { GraphData } from '../api/graph'
import type { Alerta } from '../api/alerts'
import { fetchGraph } from '../api/graph'
import { fetchAlerts } from '../api/alerts'

interface LandingViewProps {
  onExplore: () => void
}

export const LandingView: FC<LandingViewProps> = ({ onExplore }) => {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [alerts, setAlerts] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [alertDismissed, setAlertDismissed] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchGraph(undefined, 200),
      fetchAlerts({ limit: 500 }),
    ])
      .then(([gData, aData]) => {
        setGraphData(gData)
        setAlerts(aData.alertas ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const orgCount = graphData?.nodes.filter(n => n.tipo === 'Organismo').length ?? 0
  const empCount = graphData?.nodes.filter(n => n.tipo === 'Empresa').length ?? 0
  const totalMonto = alerts.reduce((s, a) => s + parseFloat(String(a.monto ?? '0')), 0)
  const highCount = alerts.filter(a => a.severidad === 'high').length

  const formatBillions = (n: number) =>
    n >= 1_000_000_000 ? `$${(n / 1_000_000_000).toFixed(1)}B` : `$${(n / 1_000_000).toFixed(0)}M`

  const stats = [
    { label: formatBillions(totalMonto), sub: 'MONTO OBSERVADO', detail: alerts.length > 0 ? `${alerts.length} ALERTAS` : undefined },
    { label: `${highCount}`, sub: 'ALERTAS HIGH', detail: 'CRITICAL SEVERITY' },
    { label: `${orgCount}`, sub: 'ORGANISMOS', detail: 'EN DATOS' },
    { label: `${empCount}`, sub: 'EMPRESAS', detail: 'CONECTADAS' },
  ]

  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${pad(currentTime.getDate())}/${pad(currentTime.getMonth() + 1)}/${currentTime.getFullYear()}`

  return (
    <div className="h-screen flex flex-col font-sans selection:bg-[var(--color-primary-20)] selection:text-[var(--text-bright)] transition-colors duration-700 relative overflow-hidden">

      {/* Fixed overlays */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="system-scan" />
        <div className="fixed inset-0 spiderweb-grid" />
        <div className="fixed inset-0 noise-overlay" />
      </div>

      {/* Top navigation bar */}
      <nav className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-[var(--border-dim)] backdrop-blur-3xl sticky top-0 z-50 bg-[var(--bg-deep)]/70">
        <div className="flex items-center gap-12">
          <Logo />
          <div className="hidden lg:flex flex-col border-l border-[var(--border-dim)] pl-12 h-10 justify-center system-heartbeat">
            <span className="text-[9px] text-[var(--text-muted)] font-black tracking-[0.4em] uppercase mb-0.5">ANÁLISIS DE DATOS PÚBLICOS</span>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-pulse" />
              <span className="text-[9px] text-[var(--color-primary)] font-black tracking-[0.1em] uppercase">SISTEMA_ACTIVO :: FRACTURA_v4.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-[11px] font-black text-[var(--text-muted)] tracking-[0.2em] uppercase">
            <div className="flex items-center gap-3 py-3 px-6 border border-[var(--border-dim)]">
              <span className="text-[12px] text-[var(--text-main)] font-black tracking-widest">{dateStr}</span>
            </div>
            <div className="flex items-center gap-3 py-3 px-6 bg-[var(--color-primary-10)] border border-[var(--color-primary-20)]">
              <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse" />
              <span className="text-[var(--color-primary)] text-[11px] font-black uppercase tracking-widest">CONEXIÓN_ESTABLE</span>
            </div>
          </div>
          <button
            onClick={onExplore}
            className="hidden md:flex items-center gap-4 bg-[var(--text-main)] text-[var(--bg-deep)] px-8 h-12 text-[10px] font-black tracking-[0.4em] uppercase group overflow-hidden relative"
          >
            <span className="relative z-10 italic">EXPLORAR_RED</span>
            <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </nav>

      {/* Main content grid */}
      <main className="flex-1 grid gap-0 overflow-hidden" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: '1fr' }}>

        {/* Left: Narrative */}
        <div
          className="col-span-12 lg:col-span-4 p-8 md:p-12 xl:p-16 border-b lg:border-b-0 lg:border-r border-[var(--border-dim)] flex flex-col justify-center relative overflow-hidden group"
          style={{ minHeight: 0 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,var(--color-primary),transparent)] opacity-[0.04]" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[10px] font-black text-[var(--color-primary)] tracking-[0.3em] uppercase">TRANSPARENCIA_ACTIVA</span>
              <div className="flex-1 h-px bg-[var(--border-dim)] opacity-50" />
            </div>

            <h2 className="text-3xl md:text-4xl xl:text-5xl font-black tracking-[-0.04em] mb-8 md:mb-10 leading-[0.95] text-[var(--text-main)] uppercase italic">
              CHILE NO <br />
              TIENE FALTA <br />
              <span className="text-[var(--text-muted)]/20">DE DATOS.</span> <br />
              TIENE EXCESO <br />
              DE <span className="text-[var(--color-primary)] italic">SILENCIO.</span>
            </h2>

            <p className="text-[var(--text-muted)] font-bold text-sm xl:text-base mb-10 md:mb-12 max-w-sm leading-relaxed tracking-tight group-hover:text-[var(--text-main)] transition-colors">
              FRACTURA identifica patrones de colusión y redes de intereses en las contrataciones públicas del Estado.
            </p>

            <button
              onClick={onExplore}
              className="group/btn relative w-full lg:w-auto px-10 py-5 transition-all duration-700 border border-[var(--border-dim)] hover:border-[var(--color-primary-40)] bg-[var(--bg-panel)]/20 shadow-sm hover:shadow-xl hover:shadow-[var(--color-primary-10)]"
            >
              <div className="relative flex items-center justify-center gap-8">
                <span className="text-[11px] font-black tracking-[0.5em] group-hover:tracking-[0.6em] transition-all uppercase italic text-[var(--text-main)] group-hover:text-[var(--color-primary)]">
                  INICIAR_EXPLORACIÓN
                </span>
                <span className="text-[var(--color-primary)] text-lg group-hover/btn:translate-x-2 transition-all">→</span>
              </div>
            </button>
          </div>

          <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-10 opacity-20">
            <span className="text-[8px] font-mono tracking-[0.8em] uppercase text-[var(--text-muted)]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              INTELLIGENCE_LAYER_01
            </span>
            <div className="w-px h-12 bg-[var(--border-dim)]" />
            <span className="text-[8px] font-mono tracking-[0.8em] uppercase text-[var(--text-muted)]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              REGION_CL_INTEL
            </span>
          </div>
        </div>

        {/* Center: Graph */}
        <div
          className="col-span-12 lg:col-span-6 relative border-r border-[var(--border-dim)] bg-[var(--bg-panel)] overflow-hidden flex flex-col"
          style={{ minHeight: 0 }}
        >
          <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[var(--border-dim)] opacity-30" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[var(--border-dim)] opacity-30" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[var(--border-dim)] opacity-30" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[var(--border-dim)] opacity-30" />

          <div className="absolute inset-0 p-8 md:p-12 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[9px] text-[var(--text-muted)] font-black tracking-[0.3em] uppercase opacity-80">SANTIAGO // CHILE_COMPARE</span>
              <div className="flex gap-4">
                {['⬡', '◈', '●'].map((icon, idx) => (
                  <div key={idx} className="w-10 h-10 border border-[var(--border-dim)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-all text-sm">
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 relative mt-4 flex items-center justify-center" style={{ minHeight: 0 }}>
              <GlobeGraph
                data={graphData}
                loading={loading}
                error={null}
                onNodeClick={() => {}}
                width={700}
                height={400}
              />
              {!alertDismissed && (
                <div className="absolute inset-0 z-20">
                  <AlertOverlayWithDismiss alerts={alerts} onDismiss={() => setAlertDismissed(true)} />
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-10 border-t border-[var(--border-dim)] pt-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 border border-[var(--color-primary)]" />
                <span className="text-[9px] text-[var(--text-main)] font-black uppercase tracking-widest">Institución</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 border border-[var(--text-muted)] rotate-45" />
                <span className="text-[9px] text-[var(--text-main)] font-black uppercase tracking-widest">Contrato</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-[2px] bg-[var(--color-alert)]/40" />
                <span className="text-[9px] text-[var(--text-main)] font-black uppercase tracking-widest">Alerta Roja</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div
          className="col-span-12 lg:col-span-2 p-6 flex flex-col bg-[var(--bg-panel)]/50 backdrop-blur-3xl transition-all duration-700 overflow-y-auto"
          style={{ minHeight: 0 }}
        >
          <h3 className="text-[11px] font-black tracking-[0.5em] uppercase text-[var(--text-muted)] mb-10 pb-6 border-b border-[var(--border-dim)] flex justify-between items-center">
            PULSE_DATA
            <span className="text-[8px] font-mono text-[var(--color-primary-60)] tracking-widest">REAL_TIME</span>
          </h3>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {stats.map((stat, idx) => (
              <StatItem key={idx} stat={stat} i={idx} />
            ))}
          </div>

          <div className="mt-6 space-y-3 overflow-y-auto">
            {[
              { label: 'Mapa de Calor', sub: 'INTELIGENCIA TERRITORIAL' },
              { label: 'Red de Influencia', sub: 'ANÁLISIS DE GRAFOS' },
              { label: 'Metodología', sub: 'DOCUMENTACIÓN v4.0' },
            ].map((item, idx) => (
              <div key={idx} className="p-5 border border-[var(--border-dim)] hover:border-[var(--color-primary-40)] hover:bg-[var(--color-primary-10)] transition-all cursor-pointer relative group">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-main)] group-hover:text-[var(--color-primary)]">
                  {item.label}
                </p>
                <p className="text-[9px] text-[var(--text-muted)] font-black tracking-[0.2em] uppercase">
                  {item.sub}
                </p>
                <span className="absolute bottom-[-5px] right-[-5px] text-6xl font-black text-[var(--text-main)]/[0.03] group-hover:text-[var(--color-primary)]/[0.04] transition-colors">
                  {idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Industrial footer */}
      <footer className="h-16 border-t border-[var(--border-dim)] px-10 flex items-center justify-between text-[10px] font-bold text-[var(--text-main)] uppercase tracking-[0.4em] bg-[var(--bg-deep)]">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 rounded-full" />
            <span className="opacity-80">FRACTURA © 2026 // PUBLIC_INTELLIGENCE_VERSION</span>
          </div>
          <span className="hidden md:block text-[var(--border-dim)]">|</span>
          <span className="hidden md:block opacity-60">SANTIAGO_DATA // CHILE_COMPARE</span>
        </div>
        <div className="flex items-center gap-10">
          <span className="opacity-80 hover:text-[var(--color-primary)] transition-colors cursor-pointer">SYSTEM_LOGS</span>
          <span className="opacity-80 hover:text-[var(--color-primary)] transition-colors cursor-pointer">CORE_API</span>
        </div>
      </footer>
    </div>
  )
}

function AlertOverlayWithDismiss({ alerts, onDismiss }: { alerts: Alerta[]; onDismiss: () => void }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !alerts.length) return null

  const total = alerts.reduce((s, a) => s + parseFloat(String(a.monto ?? '0')), 0)
  const highSeverity = alerts.filter(a => a.severidad === 'high').length
  const formatted = total >= 1_000_000_000
    ? `$${(total / 1_000_000_000).toFixed(1)}B`
    : `$${(total / 1_000_000).toFixed(0)}M`

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <div className="relative p-10 bg-[var(--bg-deep)]/90 backdrop-blur-xl border border-[var(--color-alert)] shadow-2xl system-heartbeat pointer-events-auto">
        <button
          onClick={() => { setDismissed(true); onDismiss() }}
          className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--color-alert)] transition-colors font-mono text-[9px] font-black uppercase tracking-widest"
        >
          [CLOSE_X]
        </button>
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-2 h-2 bg-[var(--color-alert)] rounded-full animate-ping" />
            <span className="text-[9px] font-black text-[var(--color-alert)] tracking-[0.4em] uppercase">
              {highSeverity} ALERTAS CRÍTICAS
            </span>
          </div>
          <p className="text-5xl font-black tracking-[-0.08em] mb-3 text-[var(--text-main)] leading-none font-mono italic">
            {formatted}
          </p>
          <div className="h-[2px] bg-[var(--color-alert)]/40 mb-5 w-full" />
          <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] italic">
            RECURSOS OBSERVADOS
          </p>
        </div>
      </div>
    </div>
  )
}