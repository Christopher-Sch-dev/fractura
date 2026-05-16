import { type FC, useRef, useCallback } from 'react'
import ForceGraph2DLib from 'react-force-graph-2d'
import type { GraphData, GraphNode } from '../api/graph'
import type { Alerta } from '../api/alerts'

const ForceGraph2D = ForceGraph2DLib as any

interface GlobeGraphProps {
  data: GraphData | null
  loading?: boolean
  error?: string | null
  width?: number
  height?: number
  onNodeClick?: (node: GraphNode) => void
  onAlertClick?: (a: Alerta) => void
}

const NODE_COLORS: Record<string, string> = {
  Organismo: '#00E5FF',
  Empresa: '#E87C0A',
  Contrato: '#555555',
}

export const GlobeGraph: FC<GlobeGraphProps> = ({
  data,
  loading,
  error,
  width = 800,
  height = 500,
  onNodeClick,
}) => {
  const fgRef = useRef<any>(null)

  const handleClick = useCallback((node: any) => {
    onNodeClick?.(node as GraphNode)
  }, [onNodeClick])

  if (loading) {
    return (
      <div className="globe-graph-loading">
        <span className="globe-graph-loading__text mono-data">CARGANDO GRAFO...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="globe-graph-error">
        <span className="globe-graph-error__text">{error}</span>
      </div>
    )
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="globe-graph-empty">
        <span className="globe-graph-empty__text mono-data">SIN DATOS DE GRAFO</span>
      </div>
    )
  }

  return (
    <div className="globe-graph-container">
      <div className="globe-graph-legend">
        <div className="globe-graph-legend__item">
          <svg width="10" height="10"><rect width="10" height="10" fill="none" stroke="#00E5FF" strokeWidth="2"/></svg>
          <span>Organismo</span>
        </div>
        <div className="globe-graph-legend__item">
          <svg width="10" height="10"><polygon points="5,0 10,2.5 10,7.5 5,10 0,7.5 0,2.5" fill="none" stroke="#E87C0A" strokeWidth="1.5"/></svg>
          <span>Empresa</span>
        </div>
        <div className="globe-graph-legend__item">
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="none" stroke="#555555" strokeWidth="1"/></svg>
          <span>Contrato</span>
        </div>
      </div>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={width}
        height={height}
        backgroundColor="#050505"
        nodeColor={(node: any) => NODE_COLORS[node.tipo] ?? '#A0A0A0'}
        linkColor={() => 'rgba(255,255,255,0.05)'}
        linkWidth={0.6}
        nodeCanvasObjectMode={() => 'replace'}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const color = NODE_COLORS[node.tipo] ?? '#A0A0A0'
          const isOrganismo = node.tipo === 'Organismo'
          const isEmpresa = node.tipo === 'Empresa'

          const baseSize = isOrganismo ? 7 : isEmpresa ? 5 : 3
          const r = Math.max(3, baseSize)
          const cx = node.x ?? 0
          const cy = node.y ?? 0

          if (isOrganismo) {
            // Cuadrado hueco — stroke only, no fill
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.strokeRect(cx - r, cy - r, r * 2, r * 2)
            // Halo exterior semitransparente
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)'
            ctx.lineWidth = 1
            ctx.strokeRect(cx - r - 3, cy - r - 3, (r + 3) * 2, (r + 3) * 2)
          } else if (isEmpresa) {
            // Hexágono hueco — stroke only
            ctx.strokeStyle = color
            ctx.lineWidth = 1.5
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i - Math.PI / 6
              const x = cx + r * Math.cos(angle)
              const y = cy + r * Math.sin(angle)
              i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.stroke()
            // Halo exterior
            ctx.strokeStyle = 'rgba(232, 124, 10, 0.35)'
            ctx.lineWidth = 1
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i - Math.PI / 6
              const x = cx + (r + 3) * Math.cos(angle)
              const y = cy + (r + 3) * Math.sin(angle)
              i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.stroke()
          } else {
            // Círculo hueco — stroke only para Contrato
            ctx.strokeStyle = color
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, 2 * Math.PI)
            ctx.stroke()
            // Halo exterior
            ctx.strokeStyle = 'rgba(160, 160, 160, 0.2)'
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.arc(cx, cy, r + 2, 0, 2 * Math.PI)
            ctx.stroke()
          }

          // Label solo si está lo suficientemente zoomed in
          if (isOrganismo && globalScale >= 0.8) {
            ctx.font = `${Math.max(10, 11 / globalScale)}px JetBrains Mono, monospace`
            ctx.fillStyle = 'rgba(0, 229, 255, 0.8)'
            ctx.textAlign = 'center'
            ctx.fillText(node.label, cx, cy + r + 14)
          }
        }}
        onNodeClick={handleClick}
      />
    </div>
  )
}