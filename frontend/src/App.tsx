import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom'
import { LandingView } from './pages/LandingView'
import { DetailView } from './pages/DetailView'
import Background3D from './components/Background3D'
import { FrequencyBars } from './components/FrequencyBars'
import './App.css'

// Inner app that has access to router context
function AppInner() {
  const [searchParams] = useSearchParams()
  const nodeId = searchParams.get('node')

  return (
    <div className="w-full h-full min-h-screen relative overflow-hidden bg-[var(--bg-deep)]">
      {/* Shared global background layer - always behind content */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Background3D mode={nodeId ? 'detail' : 'landing'} />
      </div>

      {/* Fixed overlays (scanlines, grid, noise) */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="system-scan" />
        <div className="fixed inset-0 spiderweb-grid" />
        <div className="fixed inset-0 noise-overlay" />
      </div>

      {/* Frequency bars - decorative overlay */}
      <div className="fixed bottom-3 right-3 pointer-events-none" style={{ zIndex: 5 }}>
        <FrequencyBars mode={nodeId ? 'detail' : 'landing'} />
      </div>

      {/* Page routes */}
      <Routes>
        <Route path="/" element={<LandingViewWrapper />} />
        <Route path="/detail" element={<DetailViewWrapper />} />
      </Routes>
    </div>
  )
}

// LandingView wrapper: uses navigate for internal links
function LandingViewWrapper() {
  const navigate = useNavigate()

  const handleExplore = (nodeId?: string) => {
    if (nodeId) {
      navigate(`/detail?node=${encodeURIComponent(nodeId)}`)
    } else {
      navigate('/detail')
    }
  }

  return <LandingView onExplore={handleExplore} />
}

// DetailView wrapper: reads ?node= from URL, provides onBack
function DetailViewWrapper() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const nodeId = searchParams.get('node')

  const handleBack = () => {
    navigate('/')
  }

  return <DetailView onBack={handleBack} initialNodeId={nodeId} />
}

// Root App with BrowserRouter
export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}