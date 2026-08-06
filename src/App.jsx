import { useState } from 'react'
import TopBar from './components/Layout/TopBar'
import BottomNav from './components/Layout/BottomNav'
import BatteryIndicator from './components/Dashboard/BatteryIndicator'
import NextDeployment from './components/Dashboard/NextDeployment'
import AlertPanel from './components/Dashboard/AlertPanel'
import TrainingScreen from './components/Training/TrainingScreen'
import SystemScreen from './components/System/SystemScreen'
import ScannerScreen from './components/Scanner/ScannerScreen'
import FuelScreen from './components/Firewall/FuelScreen'
import { useStore } from './store/useStore'
import { useCatalog } from './store/useCatalog'

function HomeScreen() {
  const { exercises, modules } = useCatalog()
  const activeProtocol = useStore((s) => s.activeProtocol)

  const protocolLabels = {
    standard: 'ESTÁNDAR',
    bypass: 'BYPASS',
    neural_priming: 'PRIMING',
  }

  return (
    <div className="space-y-4">
      <BatteryIndicator />
      <NextDeployment />
      <AlertPanel />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'PROTOCOLO', value: protocolLabels[activeProtocol], mono: false },
          { label: 'EJERCICIOS', value: exercises.length || '—', mono: true },
          { label: 'MÓDULOS', value: modules.length || '—', mono: true },
        ].map(({ label, value, mono }) => (
          <div key={label} className="bg-panel-card rounded-xl p-3 text-center border border-panel-border">
            <div className={`text-lg font-bold text-neon-green ${mono ? 'font-mono' : 'text-sm leading-6'}`}>{value}</div>
            <div className="text-[10px] text-slate-600 tracking-widest mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio')

  return (
    <div className="min-h-screen bg-panel-bg">
      <TopBar />

      <main className="max-w-lg mx-auto px-4 py-4 pb-28">
        {activeTab === 'inicio' && <HomeScreen />}
        {activeTab === 'entrenar' && <TrainingScreen />}
        {activeTab === 'escaner' && <ScannerScreen />}
        {activeTab === 'combustible' && <FuelScreen />}
        {activeTab === 'sistema' && <SystemScreen />}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
