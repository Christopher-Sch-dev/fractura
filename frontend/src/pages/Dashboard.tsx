import { type FC, useState, useEffect } from 'react'
import { useAlerts } from '../hooks/useAlerts'
import { useGraph } from '../hooks/useGraph'
import { AlertTable } from '../components/AlertTable'
import { GlobeGraph } from '../components/GlobeGraph'
import { AlertDetail } from '../components/AlertDetail'
import type { Alerta } from '../api/alerts'
import type { GraphNode } from '../api/graph'

const FOOTER_LABELS = ['EXPLORAR COMUNA', 'MAPA DE CONEXIONES', 'INVESTIGACIONES', 'METODOLOGÍA']

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
      const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      setTime(`${date} — ${clock} — EN VIVO`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="dashboard__clock mono-data">{time}</span>
}

export const Dashboard: FC = () => {
  const [limit] = useState(500)
  const { alertas, loading, error } = useAlerts({ limit })
  const [focusNodeId, setFocusNodeId] = useState<string | undefined>()
  const [selectedAlert, setSelectedAlert] = useState<Alerta | null>(null)
  const { graphData, loading: graphLoading, error: graphError } = useGraph({ nodeId: focusNodeId, limit })

  const orgCount = graphData?.nodes.filter(n => n.tipo === 'Organismo').length ?? 0
  const empCount = graphData?.nodes.filter(n => n.tipo === 'Empresa').length ?? 0
  const linkCount = graphData?.links.length ?? 0

  return (
    <div className="dashboard">
      {/* HEADER */}
      <header className="dashboard__header">
        <div className="dashboard__logo-row">
          <div className="dashboard__logo">FRACTURA</div>
          <div className="dashboard__live-badge">
            <span className="dashboard__live-dot" />
            LIVE
          </div>
          <LiveClock />
        </div>
      </header>

      {/* BODY */}
      <div className="dashboard__body">
        {/* LEFT — Hero + Alert list */}
        <section className="dashboard__left">
          <div className="dashboard__hero">
            <h1 className="dashboard__headline">
              CHILE NO TIENE FALTA DE DATOS.
              <br />
              TIENE EXCESO DE{' '}
              <span className="dashboard__headline--accent">SILENCIO.</span>
            </h1>
            <p className="dashboard__desc">
              FRACTURA identifica patrones de fraccionamiento,
              colusion y redes de interes en las contrataciones publicas.
            </p>
            <button
              className="dashboard__cta"
              onClick={() => document.getElementById('alertas')?.scrollIntoView({ behavior: 'smooth' })}
            >
              EXPLORAR PATRONES
              <span className="dashboard__cta-arrow"> →</span>
            </button>
          </div>

          <div className="dashboard__alert-list" id="alertas">
            <AlertTable
              alertas={alertas}
              loading={loading}
              error={error}
              onAlertClick={(a) => setSelectedAlert(a)}
            />
          </div>
        </section>

        {/* CENTER — Graph */}
        <section className="dashboard__center">
          <div className="dashboard__graph-wrapper">
            <GlobeGraph
              data={graphData ?? undefined}
              loading={graphLoading}
              error={graphError}
              onNodeClick={(node: GraphNode) => {
                setFocusNodeId(node.id)
              }}
              onAlertClick={(a) => setSelectedAlert(a)}
            />
          </div>
        </section>

        {/* RIGHT — Stats */}
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

      {/* FOOTER */}
      <footer className="dashboard__footer">
        {FOOTER_LABELS.map((label, i) => (
          <div key={i} className="footer-card">
            {label}
            {i < FOOTER_LABELS.length - 1 && <span className="footer-card__arrow"> →</span>}
          </div>
        ))}
      </footer>

      {/* ALERT DETAIL OVERLAY */}
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
