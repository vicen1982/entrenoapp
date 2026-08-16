import MuscleThumb from './MuscleThumb'
import ExercisePhoto from './ExercisePhoto'
import { X, Clock, AlertCircle, Timer, Shield } from 'lucide-react'

const MUSCLE_LABELS = {
  cuadriceps: 'Cuádriceps', isquiotibiales: 'Isquiotibiales', gluteos: 'Glúteos',
  aductores: 'Aductores', abductores: 'Abductores', gemelos: 'Gemelos', soleo: 'Sóleo',
  core: 'Core', oblicuos: 'Oblicuos', transverso: 'Transverso', lumbar: 'Lumbar',
  dorsales: 'Dorsales', trapecio: 'Trapecio', romboides: 'Romboides',
  pectoral: 'Pectoral', deltoides: 'Deltoides', biceps: 'Bíceps', triceps: 'Tríceps',
  antebrazos: 'Antebrazos', psoas: 'Psoas', cardio: 'Motor Cardíaco',
}

export default function ExerciseDetailModal({ exercise, planItem, onClose }) {
  if (!exercise) return null

  const volume = planItem
    ? `${planItem.sets}×${planItem.reps}`
    : `${exercise.default_sets}×${exercise.default_reps}`
  const notes = planItem?.notas || exercise.notes
  const isTime = exercise.measure_type === 'seconds'

  return (
    <div className="fixed inset-0 z-[60] bg-panel-bg/97 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-slate-100 leading-tight">{exercise.name}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-mono font-bold text-neon-green">{volume}</span>
              {exercise.tempo && (
                <span className="text-[10px] text-slate-500 font-mono">tempo {exercise.tempo}</span>
              )}
              {isTime && <Timer size={11} className="text-slate-500" />}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-panel-card border border-panel-border text-slate-400 shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Anatomía + ejecución, lado a lado */}
        <div className="bg-panel-card rounded-2xl border border-panel-border p-4 mb-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <MuscleThumb muscles={exercise.muscles} size={130} zoom={false} />
              <span className="text-[9px] text-slate-500 tracking-widest font-mono">MÚSCULOS</span>
            </div>
            <div className="flex items-center justify-center">
              <ExercisePhoto exercise={exercise} size={130} />
            </div>
          </div>

          {exercise.muscles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
              {exercise.muscles.map((m) => (
                <span
                  key={m}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-neon-orange/10 border border-neon-orange/30 text-neon-orange"
                >
                  {MUSCLE_LABELS[m] || m}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Datos del plan */}
        {(planItem?.modulo_tactico || planItem?.peso_sugerido || exercise.rest_seconds > 0) && (
          <div className="bg-panel-card rounded-2xl border border-panel-border p-4 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              {planItem?.modulo_tactico && (
                <span className="text-[10px] px-2 py-1 rounded-lg bg-panel-bg border border-panel-border text-slate-300">
                  {planItem.modulo_tactico}
                </span>
              )}
              {planItem?.peso_sugerido && (
                <span className="text-[10px] px-2 py-1 rounded-lg bg-panel-bg border border-neon-orange/30 text-neon-orange">
                  {planItem.peso_sugerido}
                </span>
              )}
              {exercise.rest_seconds > 0 && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-panel-bg border border-panel-border text-slate-400">
                  <Clock size={10} /> {exercise.rest_seconds}s descanso
                </span>
              )}
            </div>
          </div>
        )}

        {/* Cómo se hace */}
        {notes && (
          <div className="bg-panel-card rounded-2xl border panel-border-green p-4 mb-3">
            <div className="text-[10px] text-neon-green tracking-widest font-mono mb-2">CÓMO SE HACE</div>
            <p className="text-xs text-slate-300 leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Advertencias */}
        {exercise.warnings?.length > 0 && (
          <div className="bg-panel-card rounded-2xl border border-neon-orange/25 p-4">
            <div className="text-[10px] text-neon-orange tracking-widest font-mono mb-2">CUIDADOS</div>
            <div className="space-y-1.5">
              {exercise.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <AlertCircle size={11} className="text-neon-orange shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {exercise.rehab_priority === 'critica' && (
          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/25">
            <Shield size={13} className="text-red-400 shrink-0" />
            <span className="text-xs text-red-400">Ejercicio crítico del protocolo de rehabilitación</span>
          </div>
        )}
      </div>
    </div>
  )
}
