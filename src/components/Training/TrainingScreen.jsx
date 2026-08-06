import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useCatalog, filterByProtocol } from '../../store/useCatalog'
import { useSession } from '../../store/useSession'
import { useAilments, excludedByAilments } from '../../store/useAilments'
import ExerciseCard from './ExerciseCard'
import SessionScreen from './SessionScreen'
import HistoryScreen from './HistoryScreen'
import CoachScreen from './CoachScreen'
import exercisesData from '../../data/exercises.json'
import {
  Activity, AlertTriangle, Zap, Shield, ChevronDown, ChevronUp,
  Dumbbell, Anchor, Flame, ShieldCheck, HeartPulse, Wrench, Database, Play,
  Sparkles, ShieldAlert, X
} from 'lucide-react'

const PROTOCOL_META = {
  standard: {
    name: 'Protocolo Estándar',
    description: 'Catálogo completo disponible',
    color: 'neon-green',
    icon: Activity,
  },
  bypass: {
    name: 'Protocolo Bypass Sóleo',
    description: 'Ejercicios con carga de sóleo bloqueados',
    color: 'neon-orange',
    icon: AlertTriangle,
    alert: 'MODO BYPASS — Protección de sóleo en curso',
  },
  neural_priming: {
    name: 'Neural Priming',
    description: 'Solo activación: volumen bajo, velocidad alta',
    color: 'neon-blue',
    icon: Zap,
    alert: 'MODO PRE-PARTIDO — Activación sin fatiga',
  },
}

const MODULE_ICONS = {
  potencia: Zap,
  piernas: Dumbbell,
  empuje: Shield,
  traccion: Anchor,
  brazos: Flame,
  core: ShieldCheck,
  vo2max: HeartPulse,
  descompresion: Wrench,
}

function ModuleAccordion({ module, exercises, blockedCount, accentColor }) {
  const [open, setOpen] = useState(false)
  const Icon = MODULE_ICONS[module.id] || Activity

  return (
    <div className="bg-panel-card rounded-2xl border border-panel-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className={`p-2.5 rounded-xl bg-${accentColor}/10 border border-${accentColor}/20 shrink-0`}>
          <Icon size={18} className={`text-${accentColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-200">{module.name}</div>
          <div className="text-xs text-slate-500">{module.subtitle}</div>
        </div>
        <div className="text-right shrink-0 flex items-center gap-2">
          <div>
            <div className={`text-sm font-bold font-mono text-${accentColor}`}>{exercises.length}</div>
            {blockedCount > 0 && (
              <div className="text-[10px] text-neon-orange font-mono">{blockedCount} 🔒</div>
            )}
          </div>
          {open ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {exercises.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-3">
              Sin ejercicios disponibles con el protocolo activo
            </p>
          ) : (
            exercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} accentColor={accentColor} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function TrainingScreen() {
  const activeProtocol = useStore((s) => s.activeProtocol)
  const alerts = useStore((s) => s.alerts)
  const toggleAlert = useStore((s) => s.toggleAlert)
  const { modules, exercises, loaded, error } = useCatalog()
  const session = useSession((s) => s.session)
  const checking = useSession((s) => s.checking)
  const startSession = useSession((s) => s.start)
  const { ailments, load: loadAilments, resolve: resolveAilment } = useAilments()
  const [view, setView] = useState('hoy')
  const [showCoach, setShowCoach] = useState(false)

  useEffect(() => { loadAilments() }, [])

  // Sesión activa => modo tracker
  if (session) return <SessionScreen />

  const meta = PROTOCOL_META[activeProtocol]
  const Icon = meta.icon

  const weekDay = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
  const dayKey = {
    'lunes': 'monday', 'martes': 'tuesday', 'miércoles': 'wednesday',
    'jueves': 'thursday', 'viernes': 'friday', 'sábado': 'saturday', 'domingo': 'sunday'
  }[weekDay] || 'monday'
  const todaySchedule = exercisesData.weeklySchedule[dayKey]

  const excludedIds = excludedByAilments(ailments)
  const available = filterByProtocol(exercises, activeProtocol, excludedIds)

  if (loaded && (error || exercises.length === 0)) {
    return (
      <div className="bg-panel-card rounded-2xl border border-neon-orange/30 p-6 text-center space-y-3">
        <Database size={28} className="text-neon-orange mx-auto" />
        <div className="text-sm font-bold text-neon-orange tracking-wider">CATÁLOGO NO INICIALIZADO</div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ejecutá el script <span className="font-mono text-slate-300">supabase/phase1.sql</span> en
          el SQL Editor de Supabase para cargar los 8 módulos y el catálogo de ejercicios.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Switch HOY / HISTORIAL */}
      <div className="grid grid-cols-2 gap-2">
        {[['hoy', 'HOY'], ['historial', 'HISTORIAL']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`py-2.5 rounded-xl border text-xs font-bold tracking-widest transition-panel ${
              view === id
                ? 'bg-neon-green/10 border-neon-green/40 text-neon-green'
                : 'bg-panel-card border-panel-border text-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'historial' ? <HistoryScreen /> : (
      <>
      {/* Entrenador IA */}
      <button
        onClick={() => setShowCoach(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs font-bold tracking-widest transition-panel"
      >
        <Sparkles size={14} />
        PEGAR RUTINA / REPORTAR DOLENCIA
      </button>

      {/* Dolencias activas */}
      {ailments.length > 0 && (
        <div className="space-y-2">
          {ailments.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-neon-orange/5 border border-neon-orange/25">
              <ShieldAlert size={14} className="text-neon-orange shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-neon-orange font-medium truncate">{a.description}</div>
                <div className="text-[10px] text-slate-500">
                  {(a.excluded_exercise_ids || []).length} ejercicios restringidos
                </div>
              </div>
              <button onClick={() => resolveAilment(a.id)} className="p-1.5 text-slate-600 hover:text-neon-green transition-panel shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Iniciar sesión */}
      <button
        onClick={() => startSession(activeProtocol)}
        disabled={checking}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-neon-green/15 border border-neon-green/40 text-neon-green text-sm font-bold tracking-widest transition-panel glow-green disabled:opacity-50"
      >
        <Play size={16} strokeWidth={2.5} />
        INICIAR SESIÓN DE ENTRENAMIENTO
      </button>

      {/* Protocol header */}
      <div className={`bg-panel-card rounded-2xl p-4 border panel-border-${meta.color === 'neon-green' ? 'green' : meta.color === 'neon-orange' ? 'orange' : 'blue'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-${meta.color}/10 border border-${meta.color}/25`}>
            <Icon size={18} className={`text-${meta.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-bold text-${meta.color}`}>{meta.name}</div>
            <div className="text-xs text-slate-500">{meta.description}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-600 tracking-wider">HOY</div>
            <div className="text-xs text-slate-300 font-medium">{todaySchedule?.focus || 'LIBRE'}</div>
          </div>
        </div>
        {meta.alert && (
          <div className={`flex items-center gap-2 mt-3 p-2 rounded-lg bg-${meta.color}/5 border border-${meta.color}/20 text-xs text-${meta.color}`}>
            <Shield size={12} className="shrink-0" />
            {meta.alert}
          </div>
        )}
      </div>

      {/* Alert toggles */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => toggleAlert('soleoPain')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-panel
            ${alerts.soleoPain
              ? 'bg-neon-orange/10 border-neon-orange/40 text-neon-orange'
              : 'bg-panel-card border-panel-border text-slate-500'
            }`}
        >
          <AlertTriangle size={14} />
          {alerts.soleoPain ? 'BYPASS ON' : 'Dolor Sóleo'}
        </button>
        <button
          onClick={() => toggleAlert('matchTomorrow')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-panel
            ${alerts.matchTomorrow
              ? 'bg-neon-blue/10 border-neon-blue/40 text-neon-blue'
              : 'bg-panel-card border-panel-border text-slate-500'
            }`}
        >
          <Zap size={14} />
          {alerts.matchTomorrow ? 'PRIMING ON' : 'Partido Mañana'}
        </button>
      </div>

      {/* Stats line */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-600 font-mono">
        <span>{available.length} EJERCICIOS DISPONIBLES</span>
        {activeProtocol !== 'standard' && (
          <span className="text-neon-orange">{exercises.length - available.length} BLOQUEADOS</span>
        )}
      </div>

      {/* Módulos */}
      <div className="space-y-3">
        {modules.map((mod) => {
          const modAll = exercises.filter((e) => e.module === mod.id)
          const modAvailable = available.filter((e) => e.module === mod.id)
          return (
            <ModuleAccordion
              key={mod.id}
              module={mod}
              exercises={modAvailable}
              blockedCount={modAll.length - modAvailable.length}
              accentColor={meta.color}
            />
          )
        })}
      </div>

      {/* Schedule semanal */}
      <div className="bg-panel-card rounded-2xl p-4 border border-panel-border">
        <div className="text-xs text-slate-500 tracking-widest mb-3 font-mono">SCHEDULE SEMANAL</div>
        <div className="grid grid-cols-7 gap-1">
          {Object.entries(exercisesData.weeklySchedule).map(([day, schedule]) => {
            const labels = { monday: 'L', tuesday: 'M', wednesday: 'X', thursday: 'J', friday: 'V', saturday: 'S', sunday: 'D' }
            const isToday = day === dayKey
            const hasProtocol = !!schedule.protocolId
            return (
              <div
                key={day}
                className={`text-center p-2 rounded-lg ${
                  isToday
                    ? `bg-${meta.color}/10 border border-${meta.color}/30`
                    : 'bg-panel-bg border border-panel-border'
                }`}
              >
                <div className={`text-xs font-bold ${isToday ? `text-${meta.color}` : 'text-slate-500'}`}>
                  {labels[day]}
                </div>
                <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${hasProtocol ? 'bg-neon-green' : 'bg-panel-border'}`} />
              </div>
            )
          })}
        </div>
      </div>
      </>
      )}

      {showCoach && <CoachScreen onClose={() => { setShowCoach(false); loadAilments() }} />}
    </div>
  )
}
