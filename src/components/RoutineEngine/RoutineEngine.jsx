import { useStore } from '../../store/useStore'
import exercisesData from '../../data/exercises.json'
import ExerciseCard from './ExerciseCard'
import { Activity, AlertTriangle, Zap, Shield, RefreshCw } from 'lucide-react'

const PROTOCOL_META = {
  standard: {
    icon: Activity,
    color: 'neon-green',
    borderClass: 'panel-border-green',
    glowClass: 'glow-green',
    badge: 'ESTÁNDAR',
  },
  bypass: {
    icon: AlertTriangle,
    color: 'neon-orange',
    borderClass: 'panel-border-orange',
    glowClass: 'glow-orange',
    badge: 'BYPASS SÓLEO',
  },
  neural_priming: {
    icon: Zap,
    color: 'neon-blue',
    borderClass: 'panel-border-blue',
    glowClass: 'glow-blue',
    badge: 'NEURAL PRIMING',
  },
}

export default function RoutineEngine() {
  const activeProtocol = useStore((s) => s.activeProtocol)
  const alerts = useStore((s) => s.alerts)
  const toggleAlert = useStore((s) => s.toggleAlert)

  const protocol = exercisesData.protocols[activeProtocol]
  const meta = PROTOCOL_META[activeProtocol]
  const Icon = meta.icon

  const weekDay = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
  const dayKey = {
    'lunes': 'monday', 'martes': 'tuesday', 'miércoles': 'wednesday',
    'jueves': 'thursday', 'viernes': 'friday', 'sábado': 'saturday', 'domingo': 'sunday'
  }[weekDay] || 'monday'
  const todaySchedule = exercisesData.weeklySchedule[dayKey]

  return (
    <div className="space-y-4">
      {/* Protocol Header */}
      <div className={`bg-panel-card rounded-lg p-5 border transition-panel ${meta.borderClass} ${meta.glowClass}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded bg-${meta.color}/10 border border-${meta.color}/30`}>
              <Icon size={16} className={`text-${meta.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold text-${meta.color} tracking-wider`}>{protocol.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded border border-${meta.color}/30 bg-${meta.color}/10 text-${meta.color} tracking-widest`}>
                  {meta.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{protocol.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 tracking-wider">HOY</div>
            <div className="text-xs text-slate-400 font-medium">{todaySchedule?.focus || 'LIBRE'}</div>
          </div>
        </div>

        {/* Alert banner */}
        {protocol.alert && (
          <div className={`flex items-center gap-2 p-2 rounded bg-${meta.color}/5 border border-${meta.color}/20 text-xs text-${meta.color} tracking-wider mt-2`}>
            <Shield size={12} />
            {protocol.alert}
          </div>
        )}
      </div>

      {/* Quick Alert Toggles */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => toggleAlert('soleoPain')}
          className={`flex items-center gap-2 p-3 rounded border text-xs font-medium tracking-wider transition-panel
            ${alerts.soleoPain
              ? 'bg-neon-orange/10 border-neon-orange/40 text-neon-orange'
              : 'bg-panel-card border-panel-border text-slate-500 hover:border-neon-orange/30 hover:text-neon-orange'
            }`}
        >
          <AlertTriangle size={14} className="shrink-0" />
          <span>{alerts.soleoPain ? '✓ BYPASS ON' : 'DOLOR SÓLEO'}</span>
        </button>
        <button
          onClick={() => toggleAlert('matchTomorrow')}
          className={`flex items-center gap-2 p-3 rounded border text-xs font-medium tracking-wider transition-panel
            ${alerts.matchTomorrow
              ? 'bg-neon-blue/10 border-neon-blue/40 text-neon-blue'
              : 'bg-panel-card border-panel-border text-slate-500 hover:border-neon-blue/30 hover:text-neon-blue'
            }`}
        >
          <Zap size={14} className="shrink-0" />
          <span>{alerts.matchTomorrow ? '✓ PRIMING ON' : 'PARTIDO MAÑANA'}</span>
        </button>
      </div>

      {/* Exercise list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 tracking-widest flex items-center gap-2">
            <Activity size={12} />
            EJERCICIOS — {protocol.exercises.length} MOVIMIENTOS
          </span>
          <span className="text-xs text-slate-600">
            {protocol.exercises.filter(e => e.rehab_priority === 'critica').length} CRÍTICOS
          </span>
        </div>
        <div className="space-y-3">
          {protocol.exercises.map((exercise, i) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={i + 1} protocolColor={meta.color} />
          ))}
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-panel-card rounded-lg p-4 panel-border">
        <div className="text-xs text-slate-500 tracking-widest mb-3">SCHEDULE SEMANAL</div>
        <div className="grid grid-cols-7 gap-1">
          {Object.entries(exercisesData.weeklySchedule).map(([day, schedule]) => {
            const labels = { monday: 'L', tuesday: 'M', wednesday: 'X', thursday: 'J', friday: 'V', saturday: 'S', sunday: 'D' }
            const isToday = day === dayKey
            const hasProtocol = !!schedule.protocolId
            const pMeta = schedule.protocolId ? PROTOCOL_META[schedule.protocolId] : null
            return (
              <div
                key={day}
                className={`text-center p-2 rounded transition-panel ${
                  isToday
                    ? `bg-${meta.color}/10 border border-${meta.color}/30`
                    : 'bg-panel-bg border border-panel-border'
                }`}
              >
                <div className={`text-xs font-bold ${isToday ? `text-${meta.color}` : 'text-slate-500'}`}>
                  {labels[day]}
                </div>
                <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
                  hasProtocol && pMeta ? `bg-${pMeta.color}` : 'bg-panel-border'
                }`} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
