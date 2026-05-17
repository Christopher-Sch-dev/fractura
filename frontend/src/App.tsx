import { useState } from 'react'
import { LandingView } from './pages/LandingView'
import { DetailView } from './pages/DetailView'
import Background3D from './components/Background3D'
import { FrequencyBars } from './components/FrequencyBars'
import './App.css'

type View = 'landing' | 'detail'

export default function App() {
  const [view, setView] = useState<View>('landing')

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
        <LandingView onExplore={() => setView('detail')} />
      ) : (
        <DetailView onBack={() => setView('landing')} />
      )}
    </div>
  )
}