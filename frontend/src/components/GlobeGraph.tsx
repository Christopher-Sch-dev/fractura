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
        <span style={{ color: '#00e5ff' }}>■ Organismo</span>
        <span style={{ color: '#e87c0a' }}>⬡ Empresa</span>
        <span style={{ color: '#f0f0e8' }}>● Contrato</span>
        {virginiaId && <span style={{ color: '#ff1a1a' }}>● Virginia Reginato</span>}
      </div>

      <style>{`
        .globe-graph {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .globe-graph__canvas {
          background: var(--color-bg);
          border: 1px solid rgba(0, 229, 255, 0.15);
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
        }
        .globe-graph__overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(12, 11, 9, 0.7);
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: rgba(240, 240, 232, 0.5);
          letter-spacing: 0.1em;
          z-index: 2;
          border-radius: 0 !important;
        }
        .globe-graph__overlay--error { color: var(--color-alert); }
        .globe-graph__legend {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          font-size: 0.6875rem;
          font-family: var(--font-heading);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 0.35rem 0;
        }
      `}</style>
    </div>
  )
}