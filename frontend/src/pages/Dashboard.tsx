import { type FC, useState, useMemo } from 'react'
import { useAlerts } from '../hooks/useAlerts'
import { useGraph } from '../hooks/useGraph'
import { AlertTable } from '../components/AlertTable'
import { GlobeGraph } from '../components/GlobeGraph'
import { ScanlineOverlay } from '../components/ScanlineOverlay'
import { GlitchText } from '../components/GlitchText'
import { AlertDetail } from '../components/AlertDetail'
import type { Alerta } from '../api/alerts'
import type { GraphNode } from '../api/graph'

const FOOTER_CARDS = [
  { label: 'EXPLORA TU COMUNA', attr: 'data-status', value: 'proximamente' },
  { label: 'MAPA DE CONEXIONES', attr: 'data-status', value: 'proximamente' },
  { label: 'INVESTIGACIONES', attr: 'data-status', value: 'proximamente' },
  { label: 'METODOLOGÍA', attr: 'data-status', value: 'proximamente' },
]

function formatCLP(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

export const Dashboard: FC = () => {
  const [limit] = useState(500)
  const { alertas, loading, error } = useAlerts({ limit })
  const [focusNodeId, setFocusNodeId] = useState<string | undefined>()
  const [selectedAlert, setSelectedAlert] = useState<Alerta | null>(null)
  const { graphData, loading: graphLoading, error: graphError } = useGraph({ nodeId: focusNodeId, limit })

  const stats = useMemo(() => {
    const total = alertas.length
    const organismos = new Set(alertas.filter(a => a.organismo_id).map(a => a.organismo_id)).size
    const empresas = new Set(alertas.filter(a => a.empresa_rut).map(a => a.empresa_rut)).size
    const montoTotal = alertas.reduce((acc, a) => acc + (Number(a.monto) || 0), 0)
    return { total, organismos, empresas, montoTotal }
  }, [alertas])

  const virginiaAnchor = alertas.find(a =>
    a.empresa_rut?.toLowerCase().includes('reginato') ||
    a.mensaje?.toLowerCase().includes('viña del mar') ||
    a.descripcion?.toLowerCase().includes('reginato')
  )

  const graphWithVirginia = virginiaAnchor && graphData
    ? {
        nodes: [
          ...graphData.nodes,
          {
            id: `virginia-${virginiaAnchor.id}`,
            label: 'VIRGINIA REGINATO',
            tipo: 'Empresa' as const,
            isVirginia: true,
          },
        ],
        links: [...graphData.links],
      }
    : graphData

  const today = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()

  const scrollToAlerts = () => {
    document.querySelector('.dashboard__alerts-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="dashboard">
      <ScanlineOverlay />

      {/* Background text decoration */}
      <div className="dashboard__bg-text" aria-hidden="true">FRACTURA</div>

      {/* Header */}
      <header className="dashboard__header">
        <div className="dashboard__logo-row">
          <GlitchText className="dashboard__logo" active={false}>
            FRACTURA
          </GlitchText>
          <span className="dashboard__live-badge">
            <span className="dashboard__live-dot" />
            EN VIVO
          </span>
          <span className="dashboard__date mono-data">{today}</span>
        </div>
      </header>

      {/* Hero */}
      <section className="dashboard__hero">
        <h1 className="dashboard__headline">
          CHILE NO TIENE FALTA DE DATOS.<br />
          TIENE EXCESO DE SILENCIO.
        </h1>
        <p className="dashboard__subheadline">
          FRACTURA identifica patrones de fraccionamiento, colusión y redes de interés
          en las contrataciones públicas.
        </p>
        <button className="dashboard__cta mono-data" onClick={scrollToAlerts}>
          EXPLORAR PATRONES →
        </button>
      </section>

      {/* Stats bar — 4 cifras reales */}
      <div className="dashboard__stats">
        <div className="dashboard__stat mono-data">
          <span className="dashboard__stat-value">{stats.total}</span>
          <span className="dashboard__stat-label">ALERTAS ACTIVAS</span>
        </div>
        <div className="dashboard__stat-divider" />
        <div className="dashboard__stat mono-data">
          <span className="dashboard__stat-value">{stats.organismos}</span>
          <span className="dashboard__stat-label">ORGANISMOS</span>
        </div>
        <div className="dashboard__stat-divider" />
        <div className="dashboard__stat mono-data">
          <span className="dashboard__stat-value">{stats.empresas}</span>
          <span className="dashboard__stat-label">EMPRESAS</span>
        </div>
        <div className="dashboard__stat-divider" />
        <div className="dashboard__stat mono-data">
          <span className="dashboard__stat-value">${formatCLP(stats.montoTotal)}</span>
          <span className="dashboard__stat-label">MONTO TOTAL</span>
        </div>
      </div>

      {/* Alerts */}
      <section className="dashboard__alerts-section">
        <h2 className="dashboard__section-title">ALERTAS</h2>
        <AlertTable
          alertas={alertas}
          loading={loading}
          error={error}
          onAlertClick={(a) => setSelectedAlert(a)}
        />
      </section>

      {/* Graph */}
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">GRAFO DE RELACIONES</h2>
        <div className="dashboard__graph-wrapper">
          <GlobeGraph
            data={graphWithVirginia}
            loading={graphLoading}
            error={graphError}
            virginiaId={virginiaAnchor ? `virginia-${virginiaAnchor.id}` : undefined}
            onNodeClick={(node: GraphNode) => setFocusNodeId(node.id)}
            onAlertClick={(a) => setSelectedAlert(a)}
          />
        </div>
      </section>

      {/* Footer cards */}
      <footer className="dashboard__footer">
        {FOOTER_CARDS.map(card => (
          <a
            key={card.label}
            href="#"
            className="dashboard__footer-card"
            {...{ [card.attr]: card.value }}
            onClick={e => e.preventDefault()}
          >
            <span className="dashboard__footer-card-label mono-data">{card.label}</span>
          </a>
        ))}
      </footer>

      {selectedAlert && (
        <AlertDetail
          alerta={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onShowInGraph={() => {
            const rut = selectedAlert.empresa_rut
            if (rut) {
              setFocusNodeId(rut)
              setSelectedAlert(null)
            }
          }}
        />
      )}

      <style>{`
        .dashboard {
          position: relative;
          min-height: 100vh;
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
          overflow: hidden;
        }
        .dashboard__bg-text {
          position: fixed;
          bottom: -2rem;
          left: -1rem;
          font-family: var(--font-display);
          font-size: clamp(6rem, 20vw, 16rem);
          color: rgba(0, 229, 255, 0.03);
          letter-spacing: 0.05em;
          line-height: 1;
          z-index: 0;
          pointer-events: none;
          user-select: none;
        }
        .dashboard__header {
          position: relative;
          z-index: 1;
        }
        .dashboard__logo-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .dashboard__logo {
          font-family: var(--font-display);
          font-size: 3rem;
          color: var(--color-primary);
          letter-spacing: 0.05em;
          line-height: 1;
        }
        .dashboard__live-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-heading);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--color-critical);
          text-transform: uppercase;
          border: 1px solid var(--color-critical);
          padding: 0.2rem 0.6rem;
          clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
        }
        .dashboard__live-dot {
          width: 6px;
          height: 6px;
          background: var(--color-critical);
          border-radius: 0;
          animation: pulse-dot 1.5s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .dashboard__date {
          font-size: 0.625rem;
          letter-spacing: 0.1em;
          color: rgba(240, 240, 232, 0.3);
          text-transform: uppercase;
        }
        .dashboard__hero {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 2rem 0;
          border-top: 1px solid rgba(0, 229, 255, 0.08);
          border-bottom: 1px solid rgba(0, 229, 255, 0.08);
        }
        .dashboard__headline {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 4.5rem);
          color: var(--color-text);
          letter-spacing: 0.02em;
          line-height: 1.05;
          margin: 0;
          text-transform: uppercase;
        }
        .dashboard__subheadline {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: rgba(240, 240, 232, 0.55);
          line-height: 1.5;
          max-width: 600px;
          margin: 0;
        }
        .dashboard__cta {
          align-self: flex-start;
          padding: 0.75rem 1.5rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-bg);
          background: var(--color-primary);
          border: none;
          cursor: pointer;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
          transition: opacity 0.15s;
        }
        .dashboard__cta:hover { opacity: 0.85; }
        .dashboard__stats {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 0.75rem 1rem;
          background: var(--color-bg-overlay);
          border: 1px solid rgba(0, 229, 255, 0.1);
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
        }
        .dashboard__stat { display: flex; flex-direction: column; gap: 0.1rem; }
        .dashboard__stat-value { font-size: 1.25rem; font-weight: 600; color: var(--color-primary); font-variant-numeric: tabular-nums; }
        .dashboard__stat-label { font-size: 0.5625rem; letter-spacing: 0.12em; color: rgba(240, 240, 232, 0.4); text-transform: uppercase; }
        .dashboard__stat-divider { width: 1px; height: 2rem; background: rgba(0, 229, 255, 0.15); }
        .dashboard__alerts-section { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 0.875rem; }
        .dashboard__section { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 0.875rem; }
        .dashboard__section-title {
          font-family: var(--font-heading);
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-primary);
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(0, 229, 255, 0.12);
        }
        .dashboard__graph-wrapper { overflow: hidden; }
        .dashboard__footer {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 229, 255, 0.08);
        }
        .dashboard__footer-card {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: var(--color-bg-overlay);
          border: 1px solid rgba(0, 229, 255, 0.1);
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.15s;
        }
        .dashboard__footer-card:hover { border-color: rgba(0, 229, 255, 0.3); }
        .dashboard__footer-card-label {
          font-family: var(--font-heading);
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(240, 240, 232, 0.5);
        }
      `}</style>
    </div>
  )
}