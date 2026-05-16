import { type FC, useRef, useEffect } from 'react'
import type { GraphData, GraphNode } from '../api/graph'
import type { Alerta } from '../api/alerts'

interface GlobeGraphProps {
  data: GraphData | null
  loading?: boolean
  error?: string | null
  width?: number
  height?: number
  virginiaId?: string
  onNodeClick?: (node: GraphNode) => void
  onAlertClick?: (a: Alerta) => void
}

function drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

export const GlobeGraph: FC<GlobeGraphProps> = ({
  data,
  loading,
  error,
  width = 800,
  height = 500,
  virginiaId,
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
        nodeColor: (node: any) => {
          if (node.id === virginiaId) return '#ff1a1a'
          switch (node.tipo) {
            case 'Organismo': return '#00e5ff'
            case 'Empresa': return '#e87c0a'
            case 'Contrato': return '#f0f0e8'
            default: return '#f0f0e8'
          }
        },
        nodeCanvasObjectMode: () => 'replace',
        nodeCanvasObject: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const isVirginia = node.id === virginiaId
          let baseR: number
          let color: string

          if (isVirginia) {
            baseR = 10
            color = '#ff1a1a'
          } else {
            switch (node.tipo) {
              case 'Organismo': baseR = 5; color = '#00e5ff'; break
              case 'Empresa': baseR = 5; color = '#e87c0a'; break
              case 'Contrato': baseR = 3; color = '#f0f0e8'; break
              default: baseR = 4; color = '#f0f0e8'
            }
          }

          const r = Math.max(4, baseR / globalScale)
          const cx = node.x ?? 0
          const cy = node.y ?? 0

          if (isVirginia) {
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
            ctx.beginPath()
            ctx.arc(cx, cy, r + 3 / globalScale, 0, 2 * Math.PI)
            ctx.strokeStyle = '#ff1a1a40'
            ctx.lineWidth = 1.5
            ctx.stroke()
          } else if (node.tipo === 'Organismo') {
            ctx.fillStyle = color
            ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
            ctx.strokeStyle = color + '50'
            ctx.lineWidth = 1 / globalScale
            ctx.strokeRect(cx - r - 2 / globalScale, cy - r - 2 / globalScale, (r + 2 / globalScale) * 2, (r + 2 / globalScale) * 2)
          } else if (node.tipo === 'Empresa') {
            ctx.fillStyle = color
            drawHexagon(ctx, cx, cy, r)
            ctx.fill()
            ctx.strokeStyle = color + '50'
            ctx.lineWidth = 1 / globalScale
            drawHexagon(ctx, cx, cy, r + 2 / globalScale)
            ctx.stroke()
          } else {
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
            ctx.strokeStyle = color + '50'
            ctx.lineWidth = 1 / globalScale
            ctx.beginPath()
            ctx.arc(cx, cy, r + 2 / globalScale, 0, 2 * Math.PI)
            ctx.stroke()
          }
        },
        linkColor: () => 'var(--color-primary-20)',
        linkWidth: 1,
        onNodeClick: (node: any) => {
          onNodeClick?.(node as GraphNode)
        },
        backgroundColor: 'transparent',
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
  }, [data, width, height, virginiaId, onNodeClick])

  return (
    <div className="globe-graph">
      {loading && (
        <div className="globe-graph__overlay">
          <span className="mono-data">CARGANDO GRAFO...</span>
        </div>
      )}
      {error && (
        <div className="globe-graph__overlay globe-graph__overlay--error">
          ERROR: {error}
        </div>
      )}
      <div ref={containerRef} className="globe-graph__canvas" style={{ width, height }} />

      <div className="globe-graph__legend">
        <span className="globe-graph__legend-item">
          <span className="globe-graph__legend-dot" style={{ background: '#00e5ff' }} />
          Organismo
        </span>
        <span className="globe-graph__legend-item">
          <span className="globe-graph__legend-dot" style={{ background: '#e87c0a' }} />
          Empresa
        </span>
        <span className="globe-graph__legend-item">
          <span className="globe-graph__legend-dot" style={{ background: '#f0f0e8' }} />
          Contrato
        </span>
        {virginiaId && (
          <span className="globe-graph__legend-item">
            <span className="globe-graph__legend-dot" style={{ background: '#ff1a1a' }} />
            Virginia Reginato
          </span>
        )}
      </div>
    </div>
  )
}