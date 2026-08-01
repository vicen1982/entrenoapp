import { useState } from 'react'
import Navbar from './components/Layout/Navbar'
import BatteryIndicator from './components/Dashboard/BatteryIndicator'
import NextDeployment from './components/Dashboard/NextDeployment'
import AlertPanel from './components/Dashboard/AlertPanel'
import RoutineEngine from './components/RoutineEngine/RoutineEngine'
import Firewall from './components/Firewall/Firewall'
import { useStore } from './store/useStore'

function SystemStatus() {
  const sncBattery = useStore((s) => s.sncBattery)
  const alerts = useStore((s) => s.alerts)
  const activeProtocol = useStore((s) => s.activeProtocol)

  const protocolLabels = {
    standard: { label: 'ESTÁNDAR', color: 'text-neon-green' },
    bypass: { label: 'BYPASS', color: 'text-neon-orange' },
    neural_priming: { label: 'NEURAL PRIMING', color: 'text-neon-blue' },
  }
  const p = protocolLabels[activeProtocol]
  const hasAlert = Object.values(alerts).some(Boolean)

  return (
    <div className="bg-panel-card border-b border-panel-border px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center gap-4 text-xs text-slate-600 overflow-x-auto">
        <span className="shrink-0">
          SYS: <span className={sncBattery > 60 ? 'text-neon-green' : 'text-neon-orange'}>{sncBattery}%</span>
        </span>
        <span className="text-slate-700">|</span>
        <span className="shrink-0">
          PROTO: <span className={p.color}>{p.label}</span>
        </span>
        <span className="text-slate-700">|</span>
        <span className={`shrink-0 ${hasAlert ? 'text-neon-orange' : 'text-neon-green'}`}>
          {hasAlert ? '⚠ ALERTAS ACTIVAS' : '● SISTEMA NOMINAL'}
        </span>
        <span className="text-slate-700">|</span>
        <span className="shrink-0 text-slate-700">
          {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-panel-bg grid-bg">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <SystemStatus />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-neon-green/60" />
              </div>
              <div className="flex-1 bg-panel-card rounded px-3 py-1 panel-border">
                <span className="text-xs text-slate-600 tracking-wider">enganche-os@terminal:~$ </span>
                <span className="text-xs text-neon-green">status --full</span>
                <span className="cursor" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <BatteryIndicator />
              <NextDeployment />
              <AlertPanel />
            </div>

            {/* Quick stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'DÍAS POST-OP', value: '487', unit: 'd', color: 'neon-green', sub: '16 meses rehab' },
                { label: 'PROTOCOLOS', value: '3', unit: '', color: 'neon-blue', sub: 'STD / BYPASS / PRIMING' },
                { label: 'EJERCICIOS DB', value: '11', unit: '', color: 'neon-green', sub: 'hardcoded en sistema' },
                { label: 'PUBALGIA CTRL', value: '2', unit: 'EJ', color: 'yellow-400', sub: 'Copenhagen + Pallof' },
              ].map(({ label, value, unit, color, sub }) => (
                <div key={label} className="bg-panel-card rounded-lg p-4 panel-border">
                  <div className="text-xs text-slate-600 tracking-widest mb-2">{label}</div>
                  <div className={`text-3xl font-bold text-${color} leading-none`}>
                    {value}<span className="text-lg ml-1 text-slate-500">{unit}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'routine' && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-neon-green/60" />
              </div>
              <div className="flex-1 bg-panel-card rounded px-3 py-1 panel-border">
                <span className="text-xs text-slate-600 tracking-wider">enganche-os@terminal:~$ </span>
                <span className="text-xs text-neon-green">load-protocol --dynamic</span>
              </div>
            </div>
            <RoutineEngine />
          </div>
        )}

        {activeTab === 'firewall' && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-neon-green/60" />
              </div>
              <div className="flex-1 bg-panel-card rounded px-3 py-1 panel-border">
                <span className="text-xs text-slate-600 tracking-wider">enganche-os@terminal:~$ </span>
                <span className="text-xs text-neon-green">firewall --nutrition --status</span>
              </div>
            </div>
            <Firewall />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-panel-border mt-8 py-3">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs text-slate-700 text-center tracking-widest">
            ENGANCHE_OS v2.6.0 — SISTEMA DE CONTROL BIOMECÁNICO — ACCESO RESTRINGIDO
          </p>
        </div>
      </footer>
    </div>
  )
}
