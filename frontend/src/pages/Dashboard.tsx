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
    </div>
  )
}