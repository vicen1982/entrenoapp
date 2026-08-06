import { useStore } from '../../store/useStore'

const now = new Date()
const dateStr = now.toLocaleDateString('es-ES', {
  weekday: 'short', day: '2-digit', month: 'short'
}).toUpperCase()

export default function TopBar() {
  const sncBattery = useStore((s) => s.sncBattery)
  const alerts = useStore((s) => s.alerts)
  const hasAlert = Object.values(alerts).some(Boolean)

  return (
    <header className="sticky top-0 z-40 bg-panel-bg/90 backdrop-blur-md border-b border-panel-border">
      <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${hasAlert ? 'bg-neon-orange' : 'bg-neon-green'}`} />
          <span className="text-sm font-bold tracking-widest font-mono text-neon-green">
            ENGANCHE<span className="text-slate-500">_OS</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-600 font-mono">{dateStr}</span>
          <div className="flex items-center gap-1 font-mono">
            <span className="text-slate-600">SNC</span>
            <span className={`font-bold ${sncBattery > 60 ? 'text-neon-green' : sncBattery > 30 ? 'text-yellow-400' : 'text-neon-orange'}`}>
              {sncBattery}%
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
