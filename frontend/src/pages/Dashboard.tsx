import { type FC, useState } from 'react'
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
  { label: 'EXPLORAR COMUNA' },
  { label: 'MAPA DE CONEXIONES' },
  { label: 'INVESTIGACIONES' },
  { label: 'METODOLOGÍA' },
]

export const Dashboard: FC = () => {
  const [limit] = useState(500)
  const { alertas, loading, error } = useAlerts({ limit })
  const [focusNodeId, setFocusNodeId] = useState<string | undefined>()
  const [selectedAlert, setSelectedAlert] = useState<Alerta | null>(null)
  const { graphData, loading: graphLoading, error: graphError } = useGraph({ nodeId: focusNodeId, limit })

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

  const scrollToAlertas = () => {
    document.getElementById('alertas')?.scrollIntoView({ behavior: 'smooth' })
  }

  const orgCount = graphData?.nodes.filter(n => n.tipo === 'Organismo').length ?? 0
  const empCount = graphData?.nodes.filter(n => n.tipo === 'Empresa').length ?? 0
  const linkCount = graphData?.links.length ?? 0

  return (
    <div className="dashboard">
      <ScanlineOverlay />

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

      <div className="dashboard__body">
        {/* LEFT — Hero + CTA */}
        <section className="dashboard__left">
          <h1 className="dashboard__headline">
            CHILE NO TIENE FALTA DE DATOS.<br />
            TIENE EXCESO DE <span className="dashboard__headline--accent">SILENCIO.</span>
          </h1>
          <p className="dashboard__desc">
            FRACTURA identifica patrones de fraccionamiento,
            colusión y redes de interés en las contrataciones públicas.
          </p>
          <button className="dashboard__cta" onClick={scrollToAlertas}>
            EXPLORAR PATRONES →
          </button>
        </section>

        {/* CENTER — Graph + Table */}
        <section className="dashboard__center">
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
          <div className="dashboard__table-wrapper" id="alertas">
            <AlertTable
              alertas={alertas}
              loading={loading}
              error={error}
              onAlertClick={(a) => setSelectedAlert(a)}
            />
          </div>
        </section>

        {/* RIGHT — Stats sidebar */}
        <aside className="dashboard__right">
          <div className="stat-block">
            <span className="stat-block__value">{alertas.length}</span>
            <span className="stat-block__label">ALERTAS ACTIVAS</span>
          </div>
          <div className="stat-block">
            <span className="stat-block__value">{orgCount}</span>
            <span className="stat-block__label">ORGANISMOS</span>
          </div>
          <div className="stat-block">
            <span className="stat-block__value">{empCount}</span>
            <span className="stat-block__label">EMPRESAS</span>
          </div>
          <div className="stat-block">
            <span className="stat-block__value">{linkCount}</span>
            <span className="stat-block__label">CONEXIONES</span>
          </div>
        </aside>
      </div>

      <footer className="dashboard__footer">
        {FOOTER_CARDS.map(card => (
          <div key={card.label} className="footer-card">
            {card.label}
          </div>
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
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          max-width: 1600px;
          margin: 0 auto;
          padding: 1.25rem 1.5rem;
          gap: 0;
        }
        .dashboard__header {
          display: flex;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 229, 255, 0.08);
          margin-bottom: 0;
        }
        .dashboard__logo-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .dashboard__logo {
          font-family: var(--font-display);
          font-size: 2.5rem;
          color: var(--color-primary);
          letter-spacing: 0.05em;
          line-height: 1;
        }
        .dashboard__live-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-heading);
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--color-critical);
          text-transform: uppercase;
          border: 1px solid var(--color-critical);
          padding: 0.2rem 0.6rem;
          clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
        }
        .dashboard__live-dot {
          width: 5px;
          height: 5px;
          background: var(--color-critical);
          border-radius: 0;
          animation: pulse-dot 1.5s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .dashboard__date {
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          color: rgba(240, 240, 232, 0.3);
          text-transform: uppercase;
        }
        .dashboard__body {
          display: grid;
          grid-template-columns: 30% 1fr 25%;
          min-height: 80vh;
          border: 1px solid rgba(0, 229, 255, 0.08);
          border-top: none;
        }
        .dashboard__left {
          padding: 2.5rem 2rem;
          border-right: 1px solid rgba(0, 229, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          justify-content: center;
        }
        .dashboard__headline {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 2.2vw, 2.6rem);
          line-height: 1.15;
          color: var(--color-text);
          text-transform: uppercase;
          margin: 0;
        }
        .dashboard__headline--accent {
          color: var(--color-primary);
        }
        .dashboard__desc {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          line-height: 1.7;
          color: rgba(240, 240, 232, 0.5);
          letter-spacing: 0.03em;
          margin: 0;
        }
        .dashboard__cta {
          align-self: flex-start;
          padding: 0.6rem 1.2rem;
          background: transparent;
          border: 1px solid rgba(0, 229, 255, 0.35);
          color: var(--color-primary);
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
          transition: box-shadow 180ms ease, border-color 180ms ease;
        }
        .dashboard__cta:hover {
          border-color: var(--color-primary);
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.35);
        }
        .dashboard__center {
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(0, 229, 255, 0.08);
        }
        .dashboard__graph-wrapper {
          flex: 1;
          min-height: 380px;
          border-bottom: 1px solid rgba(0, 229, 255, 0.08);
        }
        .dashboard__table-wrapper {
          padding: 0.5rem 0;
        }
        .dashboard__right {
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .stat-block {
          padding: 1.5rem 0;
          border-bottom: 1px solid rgba(0, 229, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .stat-block:first-child { border-top: 1px solid rgba(0, 229, 255, 0.08); }
        .stat-block__value {
          font-family: var(--font-display);
          font-size: 2.25rem;
          color: var(--color-primary);
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .stat-block__label {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          color: rgba(240, 240, 232, 0.35);
          text-transform: uppercase;
        }
        .dashboard__footer {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid rgba(0, 229, 255, 0.08);
        }
        .footer-card {
          padding: 1.25rem 1.5rem;
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(240, 240, 232, 0.4);
          border-right: 1px solid rgba(0, 229, 255, 0.08);
          cursor: pointer;
          transition: color 180ms, border-color 180ms;
        }
        .footer-card:last-child { border-right: none; }
        .footer-card:hover {
          color: var(--color-primary);
          border-color: rgba(0, 229, 255, 0.25);
        }
        @media (max-width: 1024px) {
          .dashboard__body {
            grid-template-columns: 1fr 1fr;
          }
          .dashboard__right {
            border-right: none;
            border-left: 1px solid rgba(0, 229, 255, 0.08);
          }
          .dashboard__left {
            grid-column: 1 / -1;
            border-right: none;
            border-bottom: 1px solid rgba(0, 229, 255, 0.08);
            padding: 1.5rem;
          }
        }
        @media (max-width: 768px) {
          .dashboard__body {
            grid-template-columns: 1fr;
          }
          .dashboard__left, .dashboard__center, .dashboard__right {
            border-right: none;
          }
          .dashboard__center {
            border-bottom: 1px solid rgba(0, 229, 255, 0.08);
          }
          .dashboard__right {
            border-left: none;
            border-top: 1px solid rgba(0, 229, 255, 0.08);
          }
          .dashboard__footer {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard__footer .footer-card:nth-child(2n) {
            border-right: none;
          }
          .dashboard__footer .footer-card:nth-child(n+3) {
            border-top: 1px solid rgba(0, 229, 255, 0.08);
          }
        }
      `}</style>
    </div>
  )
}