import { useCatalog } from '../../store/useCatalog'
import { DAY_LABELS } from '../../store/useRoutinePlan'
import { X, Dumbbell, CalendarX2 } from 'lucide-react'

export default function DayDetailModal({ day, dayBlock, isToday, onClose }) {
  const { exercises: catalogExercises } = useCatalog()

  return (
    <div className="fixed inset-0 z-50 bg-panel-bg/97 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-200 tracking-wide">{DAY_LABELS[day]}</div>
            {isToday && <div className="text-[10px] text-neon-green font-mono tracking-widest">HOY</div>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-panel-card border border-panel-border text-slate-400">
            <X size={16} />
          </button>
        </div>

        {!dayBlock ? (
          <div className="bg-panel-card rounded-2xl border border-panel-border p-8 text-center space-y-3">
            <CalendarX2 size={24} className="text-slate-600 mx-auto" />
            <p className="text-xs text-slate-500">
              Sin sesión programada para este día. Pegá tu rutina semanal en "Pegar Rutina" para verla acá.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayBlock.objetivo && (
              <div className="bg-panel-card rounded-2xl border panel-border-green p-4">
                <div className="text-[10px] text-neon-green tracking-widest font-mono mb-1.5">OBJETIVO DEL DÍA</div>
                <p className="text-xs text-slate-300 leading-relaxed">{dayBlock.objetivo}</p>
              </div>
            )}

            {(dayBlock.exercises || []).length === 0 && (
              <div className="bg-panel-card rounded-2xl border border-panel-border p-6 text-center">
                <p className="text-xs text-slate-500">Día de descanso o sin ejercicios específicos cargados.</p>
              </div>
            )}

            <div className="space-y-2">
              {dayBlock.exercises.map((item, i) => {
                const ex = catalogExercises.find((e) => e.id === item.exercise_id)
                return (
                  <div key={i} className="bg-panel-card rounded-2xl border border-panel-border p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 shrink-0">
                        <Dumbbell size={12} className="text-neon-green" />
                      </div>
                      <span className="flex-1 min-w-0 text-sm text-slate-200 truncate">{ex?.name ?? '—'}</span>
                      <span className="text-xs font-mono text-neon-green shrink-0">{item.sets}×{item.reps}</span>
                    </div>
                    {(item.modulo_tactico || item.peso_sugerido) && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2 ml-9">
                        {item.modulo_tactico && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-panel-bg border border-panel-border text-slate-400">
                            {item.modulo_tactico}
                          </span>
                        )}
                        {item.peso_sugerido && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-panel-bg border border-neon-orange/30 text-neon-orange">
                            {item.peso_sugerido}
                          </span>
                        )}
                      </div>
                    )}
                    {item.notas && (
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-2 ml-9">{item.notas}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
