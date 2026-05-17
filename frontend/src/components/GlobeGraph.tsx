import { type FC, useRef, useCallback, useEffect, useState } from 'react'
import ForceGraph2DLib from 'react-force-graph-2d'
import type { GraphData, GraphNode } from '../api/graph'

const ForceGraph2D = ForceGraph2DLib as any

interface GlobeGraphProps {
  data: GraphData | null
  loading?: boolean
  error?: string | null
  width?: number
  height?: number
  onNodeClick?: (node: GraphNode) => void
  className?: string
}

interface HighlightState {
  nodeId: string | null
  neighborIds: Set<string>
  linkIds: Set<string>
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
  width = 900,
  height = 500,
  onNodeClick,
  className,
}) => {
  const fgRef = useRef<any>(null)
  const [highlight, setHighlight] = useState<HighlightState>({ nodeId: null, neighborIds: new Set(), linkIds: new Set() })

  const handleNodeClick = useCallback((node: any) => {
    if (!fgRef.current || !data) return

    const neighborIds = new Set<string>()
    const linkIds = new Set<string>()

    data.links.forEach((link: any) => {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target
      if (srcId === node.id || tgtId === node.id) {
        neighborIds.add(srcId)
        neighborIds.add(tgtId)
        linkIds.add(link.id ?? `${srcId}-${tgtId}`)
      }
    })

    setHighlight({ nodeId: node.id, neighborIds, linkIds })

    try {
      const nodeX = node.x ?? 0
      const nodeY = node.y ?? 0
      fgRef.current.centerAt(nodeX, nodeY, 400)
      fgRef.current.zoom(2.5, 400)
    } catch (e) {
      // ignore
    }

    onNodeClick?.(node as GraphNode)
  }, [data, onNodeClick])

  const handleNodeHover = useCallback((node: any) => {
    if (!data) return

    if (!node) {
      setHighlight({ nodeId: null, neighborIds: new Set(), linkIds: new Set() })
      return
    }

    const neighborIds = new Set<string>()
    const linkIds = new Set<string>()

    data.links.forEach((link: any) => {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target
      if (srcId === node.id || tgtId === node.id) {
        neighborIds.add(srcId)
        neighborIds.add(tgtId)
        linkIds.add(link.id ?? `${srcId}-${tgtId}`)
      }
    })

    setHighlight({ nodeId: node.id, neighborIds, linkIds })
  }, [data])

  useEffect(() => {
    if (data && fgRef.current) {
      setTimeout(() => {
        try {
          fgRef.current.zoomToFit(600, 30)
          fgRef.current.centerAt(0, 0, 400)
        } catch (e) {
          // ignore
        }
      }, 200)
    }
  }, [data])

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

  const containerClass = `globe-graph-container w-full h-full relative ${className ?? ''}`

  return (
    <>
      <div className={containerClass}>
        {/* Legend overlay at top-left */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-[var(--bg-deep)]/80 border border-[var(--border-dim)] p-3">
          <span className="text-[8px] font-black text-[var(--text-muted)] tracking-[0.3em] uppercase block mb-1">NODOS</span>
          {([
            { color: '#00E5FF', shape: 'rect', label: 'ORGANISMO' },
            { color: '#E87C0A', shape: 'hex', label: 'EMPRESA' },
            { color: '#555555', shape: 'circle', label: 'CONTRATO' },
          ] as const).map(({ color, shape, label }) => (
            <div key={label} className="flex items-center gap-2">
              <svg width="12" height="12">
                {shape === 'rect' && <rect x="1" y="1" width="10" height="10" fill="none" stroke={color} strokeWidth="2"/>}
                {shape === 'hex' && <polygon points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5" fill="none" stroke={color} strokeWidth="1.5"/>}
                {shape === 'circle' && <circle cx="6" cy="6" r="4" fill="none" stroke={color} strokeWidth="1"/>}
              </svg>
              <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        <ForceGraph2D
          ref={fgRef}
          graphData={data}
          width={width}
          height={height}
          backgroundColor="#0D0D0D"
          nodeColor={(node: any) => NODE_COLORS[node.tipo] ?? '#A0A0A0'}
          linkColor={(link: any) => {
            const linkId = link.id ?? `${typeof link.source === 'object' ? link.source.id : link.source}-${typeof link.target === 'object' ? link.target.id : link.target}`
            return highlight.linkIds.has(linkId) ? 'rgba(0,229,255,0.9)' : 'rgba(255,255,255,0.12)'
          }}
          linkWidth={(link: any) => {
            const linkId = link.id ?? `${typeof link.source === 'object' ? link.source.id : link.source}-${typeof link.target === 'object' ? link.target.id : link.target}`
            return highlight.linkIds.has(linkId) ? 3 : 0.8
          }}
          linkDirectionalParticles={0}
          linkCurvature={0.1}
          nodeCanvasObjectMode={() => highlight.nodeId ? 'before' : 'replace'}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const color = NODE_COLORS[node.tipo] ?? '#A0A0A0'
            const isOrganismo = node.tipo === 'Organismo'
            const isEmpresa = node.tipo === 'Empresa'
            const isHighlighted = highlight.nodeId === node.id
            const isNeighbor = highlight.neighborIds.has(node.id)
            const isDimmed = highlight.nodeId !== null && !isHighlighted && !isNeighbor

            const dimFactor = isDimmed ? 0.2 : 1.0
            const baseSize = isOrganismo ? 7 : isEmpresa ? 5 : 3
            const r = Math.max(3, baseSize)
            const cx = node.x ?? 0
            const cy = node.y ?? 0

            ctx.globalAlpha = dimFactor

            if (isOrganismo) {
              ctx.strokeStyle = color
              ctx.lineWidth = isHighlighted ? 2.5 : 2
              ctx.strokeRect(cx - r, cy - r, r * 2, r * 2)
              if (isHighlighted || isNeighbor) {
                ctx.strokeStyle = isHighlighted ? 'rgba(0,229,255,1)' : 'rgba(0,229,255,0.5)'
                ctx.lineWidth = 1
                ctx.strokeRect(cx - r - 4, cy - r - 4, (r + 4) * 2, (r + 4) * 2)
              } else {
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)'
                ctx.lineWidth = 0.5
                ctx.strokeRect(cx - r - 3, cy - r - 3, (r + 3) * 2, (r + 3) * 2)
              }
            } else if (isEmpresa) {
              ctx.strokeStyle = color
              ctx.lineWidth = isHighlighted ? 2 : 1.5
              ctx.beginPath()
              for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 6
                const x = cx + r * Math.cos(angle)
                const y = cy + r * Math.sin(angle)
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
              }
              ctx.closePath()
              ctx.stroke()
              if (isHighlighted || isNeighbor) {
                ctx.strokeStyle = isHighlighted ? 'rgba(232,124,10,1)' : 'rgba(232,124,10,0.5)'
                ctx.lineWidth = 1
                ctx.beginPath()
                for (let i = 0; i < 6; i++) {
                  const angle = (Math.PI / 3) * i - Math.PI / 6
                  const x = cx + (r + 4) * Math.cos(angle)
                  const y = cy + (r + 4) * Math.sin(angle)
                  i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
                }
                ctx.closePath()
                ctx.stroke()
              }
            } else {
              ctx.strokeStyle = color
              ctx.lineWidth = isHighlighted ? 1.5 : 1
              ctx.beginPath()
              ctx.arc(cx, cy, r, 0, 2 * Math.PI)
              ctx.stroke()
            }

            if (isOrganismo && globalScale >= 0.6 && !isDimmed) {
              ctx.font = `${11}px JetBrains Mono, monospace`
              ctx.fillStyle = isHighlighted ? 'rgba(0, 229, 255, 1)' : 'rgba(0, 229, 255, 0.7)'
              ctx.textAlign = 'center'
              ctx.fillText(node.label, cx, cy + r + 14)
            }

            ctx.globalAlpha = 1
          }}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
        />
      </div>
    </>
  )
}