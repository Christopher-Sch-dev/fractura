import { useState } from 'react'
import { LandingView } from './pages/LandingView'
import { DetailView } from './pages/DetailView'
import './App.css'

type View = 'landing' | 'detail'

export default function App() {
  const [view, setView] = useState<View>('landing')

  return (
    <div className="w-full h-full min-h-screen relative overflow-hidden bg-[var(--bg-deep)]">
      {view === 'landing' ? (
        <LandingView onExplore={() => setView('detail')} />
      ) : (
        <DetailView onBack={() => setView('landing')} />
      )}
    </div>
  )
}