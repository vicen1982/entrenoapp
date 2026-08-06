import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useStore } from './store/useStore.js'
import { useCatalog } from './store/useCatalog.js'
import { useSession } from './store/useSession.js'

function Root() {
  const loadFromSupabase = useStore((s) => s.loadFromSupabase)
  const loaded = useStore((s) => s.loaded)
  const loadCatalog = useCatalog((s) => s.load)
  const checkActiveSession = useSession((s) => s.checkActive)

  useEffect(() => {
    loadFromSupabase()
    loadCatalog()
    checkActiveSession()
  }, [])

  if (!loaded) {
    return (
      <div className="min-h-screen bg-panel-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-green text-xs tracking-widest animate-pulse mb-2">
            ENGANCHE_OS
          </div>
          <div className="text-slate-600 text-xs tracking-wider">
            CARGANDO SISTEMA...
          </div>
        </div>
      </div>
    )
  }

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
