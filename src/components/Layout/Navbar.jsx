import { Activity, Cpu, Radio } from 'lucide-react'
import { useStore } from '../../store/useStore'

const now = new Date()
const dateStr = now.toLocaleDateString('es-ES', {
  weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
}).toUpperCase()

export default function Navbar({ activeTab, setActiveTab }) {
  const sncBattery = useStore((s) => s.sncBattery)
  const alerts = useStore((s) => s.alerts)
  const hasAlert = Object.values(alerts).some(Boolean)

  const tabs = [
    { id: 'dashboard', label: 'TERMINAL', icon: Cpu },
    { id: 'routine', label: 'RUTINAS', icon: Activity },
    { id: 'firewall', label: 'FIREWALL', icon: Radio },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-panel-bg border-b border-panel-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${hasAlert ? 'bg-neon-orange animate-pulse' : 'bg-neon-green animate-pulse'}`} />
            <span className="text-sm font-bold tracking-widest text-neon-green text-glow-green">
              ENGANCHE<span className="text-slate-400">_OS</span>
            </span>
            <span className="hidden sm:inline text-xs text-slate-600 tracking-wider">v2.6.0</span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-wider transition-panel
                  ${activeTab === id
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="hidden md:inline tracking-wider">{dateStr}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">SNC</span>
              <span className={`font-bold ${sncBattery > 60 ? 'text-neon-green' : sncBattery > 30 ? 'text-yellow-400' : 'text-neon-orange'}`}>
                {sncBattery}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
