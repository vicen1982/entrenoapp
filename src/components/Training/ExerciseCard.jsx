import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, AlertCircle, Shield, Timer } from 'lucide-react'
import MuscleThumb from './MuscleThumb'

const PRIORITY_CONFIG = {
  critica: { label: 'CRÍTICO', cls: 'bg-red-500/10 border-red-500/30 text-red-400' },
  alta: { label: 'ALTA', cls: 'bg-neon-orange/10 border-neon-orange/30 text-neon-orange' },
}

export default function ExerciseCard({ exercise, accentColor = 'neon-green' }) {
  const [expanded, setExpanded] = useState(false)
  const priority = PRIORITY_CONFIG[exercise.rehab_priority]
  const isTime = exercise.measure_type === 'seconds'

  return (
    <div className="bg-panel-card rounded-xl border border-panel-border overflow-hidden transition-panel">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <MuscleThumb muscles={exercise.muscles} size={52} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200 truncate">{exercise.name}</span>
            {exercise.rehab_priority === 'critica' && (
              <Shield size={11} className="text-red-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {priority && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border tracking-wider font-medium ${priority.cls}`}>
                {priority.label}
              </span>
            )}
            {isTime && <Timer size={10} className="text-slate-600" />}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className={`text-sm font-bold font-mono text-${accentColor}`}>
            {exercise.default_sets}×{exercise.default_reps}
          </div>
          {exercise.tempo && <div className="text-[10px] text-slate-600 font-mono">{exercise.tempo}</div>}
        </div>

        <div className="text-slate-600 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-panel-border pt-3 space-y-3">
          {exercise.rest_seconds > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock size={11} />
              <span>Descanso: <span className="text-slate-300 font-medium font-mono">{exercise.rest_seconds}s</span></span>
            </div>
          )}

          {exercise.notes && (
            <p className="text-xs text-slate-400 leading-relaxed">{exercise.notes}</p>
          )}

          {exercise.muscles?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {exercise.muscles.map((m) => (
                <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-panel-surface border border-panel-border text-slate-400 tracking-wide">
                  {m}
                </span>
              ))}
            </div>
          )}

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
