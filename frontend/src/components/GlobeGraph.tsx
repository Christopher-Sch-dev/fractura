import { type FC, useRef, useEffect } from 'react'
import type { GraphData, GraphNode } from '../api/graph'
import type { Alerta } from '../api/alerts'

interface GlobeGraphProps {
  data: GraphData | null
  loading?: boolean
  error?: string | null
  width?: number
  height?: number
  onNodeClick?: (node: GraphNode) => void
  onAlertClick?: (a: Alerta) => void
}

const NODE_COLORS = {
  Organismo: '#00E5FF',
  Empresa: '#E87C0A',
  Contrato: '#A0A0A0',
}

export const GlobeGraph: FC<GlobeGraphProps> = ({
  data,
  loading,
  error,
  width = 800,
  height = 500,
  onNodeClick,
  onAlertClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<any>(null)

  useEffect(() => {
    if (!data || !containerRef.current) return
    let cancelled = false

    import('react-force-graph-2d').then(({ default: ForceGraph2D }) => {
      if (cancelled || !containerRef.current) return

      if (fgRef.current) {
        fgRef.current._destructor?.()
        fgRef.current = null
      }

      const graphData = {
        nodes: data.nodes.map(n => ({ ...n })),
        links: data.links.map(l => ({ ...l })),
      }

      const fg = new (ForceGraph2D as any)({
        container: containerRef.current,
        graphData,
        width,
        height,
        nodeLabel: 'label',
        backgroundColor: '#050505',

        nodeColor: (node: any) => {
          switch (node.tipo) {
            case 'Organismo': return '#00E5FF'
            case 'Empresa': return '#E87C0A'
            case 'Contrato': return '#555555'
            default: return '#A0A0A0'
          }
        },

        nodeCanvasObjectMode: () => 'replace',

        nodeCanvasObject: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const color = NODE_COLORS[node.tipo as keyof typeof NODE_COLORS] ?? '#A0A0A0'
          const isOrganismo = node.tipo === 'Organismo'
          const isEmpresa = node.tipo === 'Empresa'

          const baseSize = isOrganismo ? 6 : isEmpresa ? 5 : 3
          const r = Math.max(3, baseSize / globalScale)
          const cx = node.x ?? 0
          const cy = node.y ?? 0

          // Glow for Organismo (primary) nodes
          if (isOrganismo) {
            ctx.shadowBlur = 12
            ctx.shadowColor = 'rgba(0, 229, 255, 0.6)'
          } else if (isEmpresa) {
            ctx.shadowBlur = 8
            ctx.shadowColor = 'rgba(232, 124, 10, 0.5)'
          }

          ctx.fillStyle = color

          if (isOrganismo) {
            // Square
            ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
            ctx.shadowBlur = 0
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)'
            ctx.lineWidth = 1.5 / globalScale
            ctx.strokeRect(cx - r - 3 / globalScale, cy - r - 3 / globalScale, (r + 3 / globalScale) * 2, (r + 3 / globalScale) * 2)
          } else if (isEmpresa) {
            // Hexagon
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i - Math.PI / 6
              const x = cx + r * Math.cos(angle)
              const y = cy + r * Math.sin(angle)
              i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.fill()
            ctx.shadowBlur = 0
            ctx.strokeStyle = 'rgba(232, 124, 10, 0.3)'
            ctx.lineWidth = 1 / globalScale
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i - Math.PI / 6
              const x = cx + (r + 3 / globalScale) * Math.cos(angle)
              const y = cy + (r + 3 / globalScale) * Math.sin(angle)
              i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.stroke()
          } else {
            // Circle for Contrato
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, 2 * Math.PI)
            ctx.fill()
            ctx.shadowBlur = 0
            ctx.strokeStyle = 'rgba(160, 160, 160, 0.25)'
            ctx.lineWidth = 0.5 / globalScale
            ctx.beginPath()
            ctx.arc(cx, cy, r + 2 / globalScale, 0, 2 * Math.PI)
            ctx.stroke()
          }

          // Label for Organismo nodes only
          if (isOrganismo && globalScale >= 0.8) {
            ctx.font = `${Math.max(9, 11 / globalScale)}px 'JetBrains Mono', monospace`
            ctx.fillStyle = 'rgba(0, 229, 255, 0.85)'
            ctx.textAlign = 'center'
            ctx.fillText(node.label, cx, cy + r + 12 / globalScale)
          }

          ctx.shadowBlur = 0
        },

        linkColor: () => 'rgba(0, 229, 255, 0.12)',
        linkWidth: 0.8,
        linkDirectionalParticles: 0,

        onNodeClick: (node: any) => {
          onNodeClick?.(node as GraphNode)
        },
      })

      fgRef.current = fg
    })

    return () => {
      cancelled = true
      if (fgRef.current) {
        fgRef.current._destructor?.()
        fgRef.current = null
      }
    }
  }, [data, width, height, onNodeClick])

  return (
    <div className="globe-graph" style={{ position: 'relative', width, height }}>
      {loading && (
        <div className="globe-graph__overlay globe-graph__overlay--loading">
          <span className="globe-graph__loading-text mono-data">CARGANDO GRAFO...</span>
        </div>
      )}
      {error && (
        <div className="globe-graph__overlay globe-graph__overlay--error">
          <span className="globe-graph__error-text">ERROR: {error}</span>
        </div>
      )}
      {!data && !loading && (
        <div className="globe-graph__overlay globe-graph__overlay--empty">
          <span className="globe-graph__empty-text mono-data">SIN DATOS — EJECUTA /seed Y /detect</span>
        </div>
      )}
      <div ref={containerRef} className="globe-graph__canvas" style={{ width, height }} />

      {/* Legend */}
      <div className="globe-graph__legend">
        <div className="globe-graph__legend-item">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="0" y="0" width="10" height="10" fill="#00E5FF" />
          </svg>
          Organismo
        </div>
        <div className="globe-graph__legend-item">
          <svg width="12" height="10" viewBox="0 0 12 10">
            <polygon points="6,0 12,2.5 12,7.5 6,10 0,7.5 0,2.5" fill="#E87C0A" />
          </svg>
          Empresa
        </div>
        <div className="globe-graph__legend-item">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="4" fill="#A0A0A0" />
          </svg>
          Contrato
        </div>
      </div>
    </div>
  )
}