import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { Calendar, Clock, Target, Zap } from 'lucide-react'

function pad(n) { return String(n).padStart(2, '0') }

function getCountdown(target) {
  const now = new Date()
  const diff = target - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isPast: false,
  }
}

export default function NextDeployment() {
  const nextMatch = useStore((s) => s.nextMatch)
  const toggleAlert = useStore((s) => s.toggleAlert)
  const alerts = useStore((s) => s.alerts)
  const [countdown, setCountdown] = useState(getCountdown(new Date(nextMatch)))

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown(new Date(nextMatch))), 1000)
    return () => clearInterval(id)
  }, [nextMatch])

  const matchDate = new Date(nextMatch)
  const dateLabel = matchDate.toLocaleDateString('es-ES', {
    weekday: 'long', day: '2-digit', month: 'long'
  }).toUpperCase()

  const isMatchTomorrow = countdown.days === 1 || countdown.days === 0

  return (
    <div className={`bg-panel-card rounded-lg p-5 panel-border transition-panel ${
      isMatchTomorrow ? 'panel-border-blue glow-blue' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-neon-blue" />
          <span className="text-xs text-slate-500 tracking-widest">PRÓXIMO DESPLIEGUE</span>
        </div>
        {isMatchTomorrow && (
          <span className="text-xs text-neon-blue tracking-wider animate-pulse font-bold">
            ⚡ PARTIDO PRÓXIMO
          </span>
        )}
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={14} className="text-slate-500" />
        <span className="text-sm text-slate-300 tracking-wide">{dateLabel}</span>
      </div>

      {/* Countdown */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { value: countdown.days, label: 'DÍAS' },
          { value: countdown.hours, label: 'HRS' },
          { value: countdown.minutes, label: 'MIN' },
          { value: countdown.seconds, label: 'SEG' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center bg-panel-bg rounded p-2 panel-border">
            <div className={`text-2xl font-bold ${isMatchTomorrow ? 'text-neon-blue text-glow-blue' : 'text-neon-green text-glow-green'}`}>
              {pad(value)}
            </div>
            <div className="text-xs text-slate-600 tracking-widest mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Pre-match toggle */}
      <button
        onClick={() => toggleAlert('matchTomorrow')}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded text-xs font-medium tracking-wider transition-panel
          ${alerts.matchTomorrow
            ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/40'
            : 'bg-panel-bg border border-panel-border text-slate-500 hover:text-slate-300 hover:border-neon-blue/30'
          }`}
      >
        <Zap size={12} />
        {alerts.matchTomorrow ? 'MODO PRE-PARTIDO ACTIVO' : 'ACTIVAR PROTOCOLO PRE-PARTIDO'}
      </button>
    </div>
  )
}
