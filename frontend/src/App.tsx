import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import type { Alerta } from './api/alerts'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              onAlertClick={(a: Alerta) => {
                console.log('[FRACTURA] alert clicked:', a.id, a.patron)
              }}
              onEntityClick={(id: string) => {
                console.log('[FRACTURA] entity clicked:', id)
              }}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App