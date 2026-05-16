import { type FC, useRef, useEffect, useCallback } from 'react'
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

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current._destructor?.()
      fgRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!data || !fgRef.current) return

    fgRef.current.graphData(data)
    fgRef.current.d3Force('charge')?.strength(-120)
    fgRef.current.d3Force('link')?.distance(80)
  }, [data])

  if (!data && !loading) {
    return (
      <div className="globe-graph" style={{ position: 'relative', width, height }}>
        <div className="globe-graph__overlay">
          <span className="globe-graph__empty mono-data">SIN DATOS DE GRAFO</span>
        </div>
        <div className="globe-graph__legend">
          <span className="globe-graph__legend-item">
            <svg width="10" height="10"><rect width="10" height="10" fill="#00E5FF"/></svg>
            Organismo
          </span>
          <span className="globe-graph__legend-item">
            <svg width="12" height="10"><polygon points="6,0 12,2.5 12,7.5 6,10 0,7.5 0,2.5" fill="#E87C0A"/></svg>
            Empresa
          </span>
          <span className="globe-graph__legend-item">
            <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#555555"/></svg>
            Contrato
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="globe-graph" style={{ position: 'relative', width, height }}>
      {loading && (
        <div className="globe-graph__overlay">
          <span className="globe-graph__loading mono-data">CARGANDO GRAFO...</span>
        </div>
      )}
      {error && (
        <div className="globe-graph__overlay globe-graph__overlay--err">
          <span className="globe-graph__err">ERROR: {error}</span>
        </div>
      )}
      <ForceGraph2D
        ref={fgRef}
        graphData={data ?? { nodes: [], links: [] }}
        width={width}
        height={height}
        backgroundColor="#050505"
        nodeLabel="label"
        nodeColor={(node: any) => NODE_COLORS[node.tipo] ?? '#A0A0A0'}
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
            ctx.shadowBlur = 14
            ctx.shadowColor = 'rgba(0, 229, 255, 0.7)'
          } else if (isEmpresa) {
            ctx.shadowBlur = 10
            ctx.shadowColor = 'rgba(232, 124, 10, 0.55)'
          }

          ctx.fillStyle = color

          if (isOrganismo) {
            ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
            ctx.shadowBlur = 0
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)'
            ctx.lineWidth = 1.5
            ctx.strokeRect(cx - r - 3, cy - r - 3, (r + 3) * 2, (r + 3) * 2)
          } else if (isEmpresa) {
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
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, 2 * Math.PI)
            ctx.fill()
            ctx.shadowBlur = 0
            ctx.strokeStyle = 'rgba(160, 160, 160, 0.2)'
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.arc(cx, cy, r + 2, 0, 2 * Math.PI)
            ctx.stroke()
          }

          if (isOrganismo && globalScale >= 0.9) {
            ctx.font = '11px JetBrains Mono, monospace'
            ctx.fillStyle = 'rgba(0, 229, 255, 0.8)'
            ctx.textAlign = 'center'
            ctx.fillText(node.label, cx, cy + r + 14)
          }

          ctx.shadowBlur = 0
        }}
        linkColor={() => 'rgba(0, 229, 255, 0.1)'}
        linkWidth={0.8}
        onNodeClick={handleClick}
      />

      <div className="globe-graph__legend">
        <span className="globe-graph__legend-item">
          <svg width="10" height="10"><rect width="10" height="10" fill="#00E5FF"/></svg>
          Organismo
        </span>
        <span className="globe-graph__legend-item">
          <svg width="12" height="10"><polygon points="6,0 12,2.5 12,7.5 6,10 0,7.5 0,2.5" fill="#E87C0A"/></svg>
          Empresa
        </span>
        <span className="globe-graph__legend-item">
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#555555"/></svg>
          Contrato
        </span>
      </div>
    </div>
  )
}