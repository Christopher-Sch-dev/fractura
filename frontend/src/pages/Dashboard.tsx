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
        links: [
          ...graphData.links,
        ],
      }
    : graphData

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
        </div>
        <p className="dashboard__subtitle">CHILE. DATOS PÚBLICOS. SIN FILTRO.</p>
      </header>

      <div className="dashboard__stats">
        <div className="dashboard__stat mono-data">
          <span className="dashboard__stat-value">{alertas.length}</span>
          <span className="dashboard__stat-label">ALERTAS ACTIVAS</span>
        </div>
        <div className="dashboard__stat-divider" />
        <div className="dashboard__stat mono-data">
          <span className="dashboard__stat-value">{graphData?.nodes.length ?? 0}</span>
          <span className="dashboard__stat-label">NODOS EN GRAFO</span>
        </div>
        <div className="dashboard__stat-divider" />
        <div className="dashboard__stat mono-data">
          <span className="dashboard__stat-value">{graphData?.links.length ?? 0}</span>
          <span className="dashboard__stat-label">CONEXIONES</span>
        </div>
      </div>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">ALERTAS</h2>
        <AlertTable
          alertas={alertas}
          loading={loading}
          error={error}
          onAlertClick={(a) => setSelectedAlert(a)}
        />
      </section>

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
          min-height: 100vh;
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .dashboard__header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
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
        .dashboard__subtitle {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          letter-spacing: 0.15em;
          color: rgba(240, 240, 232, 0.4);
          text-transform: uppercase;
        }
        .dashboard__stats {
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
        .dashboard__section { display: flex; flex-direction: column; gap: 0.875rem; }
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
      `}</style>
    </div>
  )
}