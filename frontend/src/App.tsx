import { useState } from 'react'
import { LandingView } from './pages/LandingView'
import { DetailView } from './pages/DetailView'
import Background3D from './components/Background3D'
import { FrequencyBars } from './components/FrequencyBars'
import './App.css'

type View = 'landing' | 'detail'

export default function App() {
  const [view, setView] = useState<View>('landing')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const navigateToDetail = (nodeId?: string) => {
    setSelectedNodeId(nodeId ?? null)
    setView('detail')
    if (nodeId) {
      const url = new URL(window.location.href)
      url.searchParams.set('node', nodeId)
      window.history.pushState({}, '', url.toString())
    }
  }


  const navigateBack = () => {
    setSelectedNodeId(null)
    setView('landing')
    const url = new URL(window.location.href)
    url.searchParams.delete('node')
    window.history.pushState({}, '', url.toString())
  }

  return (
    <div className="w-full h-full min-h-screen relative overflow-hidden bg-[var(--bg-deep)]">
      {/* Shared global background layer - always behind content */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Background3D mode={view} />
      </div>

      {/* Fixed overlays (scanlines, grid, noise) */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="system-scan" />
        <div className="fixed inset-0 spiderweb-grid" />
        <div className="fixed inset-0 noise-overlay" />
      </div>

      {/* Frequency bars - decorative overlay */}
      <div className="fixed bottom-3 right-3 pointer-events-none" style={{ zIndex: 5 }}>
        <FrequencyBars mode={view} />
      </div>

      {/* Page content */}
      {view === 'landing' ? (
        <LandingView onExplore={navigateToDetail} />
      ) : (
        <DetailView onBack={navigateBack} initialNodeId={selectedNodeId} />
      )}
    </div>
  )
}