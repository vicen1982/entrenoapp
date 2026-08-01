import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, RotateCcw, AlertCircle, CheckCircle2, Shield } from 'lucide-react'

const PRIORITY_CONFIG = {
  critica: { label: 'CRÍTICO', color: 'red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  alta: { label: 'ALTA', color: 'neon-orange', bg: 'bg-neon-orange/10', border: 'border-neon-orange/30' },
  normal: { label: 'NORMAL', color: 'neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30' },
}

const CATEGORY_LABELS = {
  fuerza: 'FUERZA',
  core_antirotacion: 'CORE ANTI-ROT',
  bypass: 'BYPASS',
  activacion: 'ACTIVACIÓN',
}

export default function ExerciseCard({ exercise, index, protocolColor }) {
  const [expanded, setExpanded] = useState(false)
  const [completed, setCompleted] = useState(false)
  const priority = PRIORITY_CONFIG[exercise.rehab_priority] || PRIORITY_CONFIG.normal

  return (
    <div className={`bg-panel-card rounded-lg border transition-panel overflow-hidden
      ${completed ? 'opacity-60 border-panel-border' : `border-panel-border hover:border-${protocolColor}/30`}`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 p-3">
        {/* Index + complete */}
        <button
          onClick={() => setCompleted(!completed)}
          className={`w-7 h-7 rounded shrink-0 flex items-center justify-center border transition-panel
            ${completed
              ? `bg-${protocolColor}/20 border-${protocolColor}/40`
              : 'bg-panel-bg border-panel-border hover:border-panel-surface'
            }`}
        >
          {completed
            ? <CheckCircle2 size={14} className={`text-${protocolColor}`} />
            : <span className="text-xs text-slate-600 font-mono">{index}</span>
          }
        </button>

        {/* Exercise info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {exercise.name}
            </span>
            {exercise.rehab_priority === 'critica' && (
              <Shield size={10} className="text-red-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded ${priority.bg} border ${priority.border} text-${priority.color} tracking-wider`}>
              {priority.label}
            </span>
            <span className="text-xs text-slate-600 tracking-wider">{CATEGORY_LABELS[exercise.category]}</span>
          </div>
        </div>

        {/* Sets/Reps quick view */}
        <div className="text-right shrink-0 hidden sm:block">
          <div className={`text-sm font-bold text-${protocolColor}`}>{exercise.sets}x{exercise.reps}</div>
          <div className="text-xs text-slate-600">{exercise.tempo}</div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-slate-600 hover:text-slate-300 transition-panel shrink-0"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-panel-border pt-3 space-y-3">
          {/* Metrics grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'SERIES', value: exercise.sets },
              { label: 'REPS', value: exercise.reps },
              { label: 'TEMPO', value: exercise.tempo },
            ].map(({ label, value }) => (
              <div key={label} className="bg-panel-bg rounded p-2 text-center panel-border">
                <div className={`text-sm font-bold text-${protocolColor}`}>{value}</div>
                <div className="text-xs text-slate-600 tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          {/* Rest */}
          {exercise.rest && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock size={11} />
              <span>Descanso: <span className="text-slate-300 font-medium">{exercise.rest}s</span></span>
            </div>
          )}

          {/* Notes */}
          {exercise.notes && (
            <div className="bg-panel-bg rounded p-2 panel-border">
              <div className="text-xs text-slate-600 tracking-wider mb-1">NOTAS TÉCNICAS</div>
              <p className="text-xs text-slate-300 leading-relaxed">{exercise.notes}</p>
            </div>
          )}

          {/* Muscles */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600 tracking-wider">TARGET:</span>
            {exercise.muscles.map((m) => (
              <span key={m} className="text-xs px-2 py-0.5 rounded bg-panel-bg border border-panel-border text-slate-400">
                {m.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Warnings */}
          {exercise.warnings?.length > 0 && (
            <div className="space-y-1">
              {exercise.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-neon-orange/80">
                  <AlertCircle size={10} className="shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
