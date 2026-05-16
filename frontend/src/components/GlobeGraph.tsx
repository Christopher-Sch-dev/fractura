import { type FC, useRef, useEffect } from 'react'
import type { GraphData, GraphNode } from '../api/graph'

interface GlobeGraphProps {
  data: GraphData | null
  loading?: boolean
  error?: string | null
  width?: number
  height?: number
  onNodeClick?: (node: GraphNode) => void
}

const TIPO_COLORS: Record<string, string> = {
  Organismo: '#00e5ff',
  Empresa: '#e87c0a',
  Contrato: '#ff1a1a',
}

export const GlobeGraph: FC<GlobeGraphProps> = ({
  data,
  loading,
  error,
  width = 800,
  height = 500,
  onNodeClick,
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
        nodeColor: (node: any) => TIPO_COLORS[node.tipo] ?? '#f0f0e8',
        nodeCanvasObjectMode: () => 'replace',
        nodeCanvasObject: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const r = Math.max(4, 6 / globalScale)
          ctx.beginPath()
          ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI)
          ctx.fillStyle = TIPO_COLORS[node.tipo] ?? '#f0f0e8'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(node.x ?? 0, node.y ?? 0, r + 2 / globalScale, 0, 2 * Math.PI)
          ctx.strokeStyle = (TIPO_COLORS[node.tipo] ?? '#f0f0e8') + '50'
          ctx.lineWidth = 1
          ctx.stroke()
        },
        linkColor: () => 'rgba(0, 229, 255, 0.2)',
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
  }, [data, width, height, onNodeClick])

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
        {Object.entries(TIPO_COLORS).map(([tipo, color]) => (
          <span key={tipo} style={{ color }}>
            ● {tipo}
          </span>
        ))}
      </div>

      <style>{`
        .globe-graph {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .globe-graph__canvas {
          background: rgba(12, 11, 9, 0.5);
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