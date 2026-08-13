import { useState } from 'react'
import { useCoach } from '../../store/useCoach'
import { useCatalog } from '../../store/useCatalog'
import { DAY_LABELS, todayKey } from '../../store/useRoutinePlan'
import {
  Sparkles, X, Send, AlertTriangle, Dumbbell, Check,
  ShieldAlert, ArrowRight, Loader2, Calendar, CalendarCheck
} from 'lucide-react'

const MODE_TABS = [
  { id: 'rutina', label: 'Pegar Rutina', icon: Dumbbell, placeholder: 'Pegá tu rutina completa y contame por qué la armaste así. Si tiene varios días, escribilos: "Lunes: Hip Thrust 4x8, Copenhagen 3x20s. Miércoles: Press inclinado 4x8, Remo 4x8. Viernes: ..." — cada vez que la cambies, volvés a pegarla acá y se actualiza sola.' },
  { id: 'dolencia', label: 'Reportar Dolencia', icon: AlertTriangle, placeholder: 'Contame qué te duele o molesta. Ej: "Hoy me duelen los riñones" o "Tengo tensión en el aductor derecho desde ayer"' },
]

export default function CoachScreen({ onClose }) {
  const { loading, result, error, retryAfter, ask, clear, saveRoutine, saveAndStartToday, applyAilment } = useCoach()
  const { exercises: catalogExercises } = useCatalog()
  const [mode, setMode] = useState('rutina')
  const [text, setText] = useState('')
  const [applying, setApplying] = useState(null)
  const [applied, setApplied] = useState(null)

  const tab = MODE_TABS.find((t) => t.id === mode)
  const today = todayKey()

  const submit = () => {
    if (!text.trim()) return
    clear()
    ask(text)
  }

  const doSaveOnly = async () => {
    setApplying('plan')
    await saveRoutine(result)
    setApplying(null)
    setApplied('plan')
    setTimeout(onClose, 900)
  }

  const doSaveAndStart = async () => {
    setApplying('today')
    const started = await saveAndStartToday(result)
    setApplying(null)
    if (started) {
      setApplied('today')
      setTimeout(onClose, 700)
    } else {
      setApplied('plan')
      setTimeout(onClose, 900)
    }
  }

  const apply = async () => {
    setApplying('ailment')
    await applyAilment(result)
    setApplying(null)
    setApplied('ailment')
    setTimeout(onClose, 900)
  }

  const days = result?.dias || []
  const hasTodayBlock = days.some((d) => d.day === today && (d.ejercicios || []).length > 0)
  const isMultiDay = days.filter((d) => d.day !== null).length > 1

  return (
    <div className="fixed inset-0 z-50 bg-panel-bg/97 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-neon-blue/10 border border-neon-blue/25">
            <Sparkles size={16} className="text-neon-blue" />
          </div>
          <span className="flex-1 text-sm font-bold text-slate-200 tracking-wide">ENTRENADOR VIRTUAL</span>
          <button onClick={onClose} className="p-2 rounded-xl bg-panel-card border border-panel-border text-slate-400">
            <X size={16} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {MODE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setMode(id); clear(); setApplied(null) }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold tracking-wide transition-panel ${
                mode === id
                  ? 'bg-neon-blue/10 border-neon-blue/40 text-neon-blue'
                  : 'bg-panel-card border-panel-border text-slate-500'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        {!result && (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={tab.placeholder}
              rows={7}
              className="w-full bg-panel-card border border-panel-border rounded-2xl p-4 text-sm text-slate-200 leading-relaxed focus:border-neon-blue/50 focus:outline-none resize-none"
            />
            <button
              onClick={submit}
              disabled={loading || !text.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-neon-blue/15 border border-neon-blue/40 text-neon-blue text-sm font-bold tracking-wide transition-panel disabled:opacity-40"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> INTERPRETANDO...</>
              ) : (
                <><Send size={15} /> ENVIAR AL ENTRENADOR</>
              )}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center space-y-3">
            <p className="text-xs text-red-400">
              {error === 'missing_api_key'
                ? 'El motor de IA no está configurado todavía (falta la API key en el servidor).'
                : error === 'rate_limited'
                ? `Se agotó la cuota gratuita del motor de IA${retryAfter ? ` — se libera en ${retryAfter}` : ''}. Tu texto quedó guardado, reintentá más tarde.`
                : error === 'invalid_json'
                ? 'La rutina es muy larga y la respuesta se cortó. Probá pegarla en dos partes (ej: primero Lunes y Miércoles, después Viernes).'
                : 'No se pudo procesar. Reintentá en unos segundos.'}
            </p>
            <button
              onClick={submit}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-panel-card border border-panel-border text-slate-300 text-xs font-semibold tracking-wide transition-panel disabled:opacity-50"
            >
              {loading ? 'REINTENTANDO...' : 'REINTENTAR'}
            </button>
          </div>
        )}

        {/* Resultado — RUTINA (uno o varios días) */}
        {result && result.type === 'rutina' && (
          <div className="space-y-3">
            <div className="bg-panel-card rounded-2xl border panel-border-blue p-4 glow-blue">
              <div className="text-[10px] text-neon-blue tracking-widest font-mono mb-2">
                {isMultiDay ? 'CRITERIO DEL PLAN SEMANAL' : 'QUÉ BUSCAMOS HOY'}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{result.explicacion}</p>
            </div>

            {days.map((dayBlock, i) => {
              const isToday = dayBlock.day === today
              return (
                <div
                  key={i}
                  className={`bg-panel-card rounded-2xl border p-4 ${isToday ? 'panel-border-green' : 'border-panel-border'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {dayBlock.day ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono tracking-widest ${
                        isToday ? 'border-neon-green/40 bg-neon-green/10 text-neon-green' : 'border-panel-border text-slate-500'
                      }`}>
                        {DAY_LABELS[dayBlock.day]}{isToday ? ' · HOY' : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-neon-green/40 bg-neon-green/10 text-neon-green font-mono tracking-widest">
                        SESIÓN
                      </span>
                    )}
                    <span className="text-xs text-slate-300 flex-1 truncate">{dayBlock.objetivo}</span>
                  </div>
                  <div className="space-y-1.5">
                    {(dayBlock.ejercicios || []).map((item, j) => {
                      const matched = item.exercise_id ? catalogExercises.find((e) => e.id === item.exercise_id) : null
                      const name = item.new_exercise?.name ?? matched?.name ?? 'Ejercicio'
                      return (
                        <div key={j} className="p-2.5 rounded-lg bg-panel-bg border border-panel-border">
                          <div className="flex items-center gap-2">
                            <Dumbbell size={11} className="text-neon-green shrink-0" />
                            <span className="flex-1 min-w-0 text-xs text-slate-300 truncate">
                              {name}
                              {item.new_exercise && <span className="text-neon-blue ml-1.5 text-[9px] font-mono">NUEVO</span>}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">{item.sets}×{item.reps}</span>
                          </div>
                          {(item.modulo_tactico || item.peso_sugerido) && (
                            <div className="flex items-center gap-1.5 flex-wrap mt-1.5 ml-[19px]">
                              {item.modulo_tactico && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-panel-card border border-panel-border text-slate-500">
                                  {item.modulo_tactico}
                                </span>
                              )}
                              {item.peso_sugerido && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-panel-card border border-panel-border text-neon-orange">
                                  {item.peso_sugerido}
                                </span>
                              )}
                            </div>
                          )}
                          {item.notas && (
                            <p className="text-[10px] text-slate-500 leading-relaxed mt-1.5 ml-[19px]">{item.notas}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div className="grid grid-cols-1 gap-2">
              {hasTodayBlock && (
                <button
                  onClick={doSaveAndStart}
                  disabled={!!applying || !!applied}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-neon-green/15 border border-neon-green/40 text-neon-green text-sm font-bold tracking-wide transition-panel disabled:opacity-60"
                >
                  {applied === 'today' ? (
                    <><Check size={16} /> SESIÓN DE HOY INICIADA</>
                  ) : applying === 'today' ? (
                    <><Loader2 size={16} className="animate-spin" /> ARMANDO SESIÓN...</>
                  ) : (
                    <><ArrowRight size={16} /> GUARDAR PLAN Y EMPEZAR HOY</>
                  )}
                </button>
              )}
              <button
                onClick={doSaveOnly}
                disabled={!!applying || !!applied}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-panel-card border border-panel-border text-slate-300 text-sm font-semibold tracking-wide transition-panel disabled:opacity-60"
              >
                {applied === 'plan' ? (
                  <><CalendarCheck size={15} /> PLAN GUARDADO</>
                ) : applying === 'plan' ? (
                  <><Loader2 size={15} className="animate-spin" /> GUARDANDO...</>
                ) : (
                  <><Calendar size={15} /> {hasTodayBlock ? 'SOLO GUARDAR EL PLAN' : 'GUARDAR PLAN SEMANAL'}</>
                )}
              </button>
              {!hasTodayBlock && isMultiDay && (
                <p className="text-[10px] text-slate-600 text-center">
                  Hoy ({DAY_LABELS[today]}) no tiene sesión en este plan — se guarda para el resto de la semana
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resultado — DOLENCIA */}
        {result && result.type === 'dolencia' && result.dolencia && (
          <div className="space-y-3">
            <div className="bg-panel-card rounded-2xl border panel-border-orange p-4 glow-orange">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={14} className="text-neon-orange" />
                <span className="text-[10px] text-neon-orange tracking-widest font-mono">RESTRICCIÓN MECÁNICA DETECTADA</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{result.explicacion}</p>
              {result.dolencia.muscles_affected?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {result.dolencia.muscles_affected.map((m) => (
                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-panel-bg border border-panel-border text-slate-400">{m}</span>
                  ))}
                </div>
              )}
            </div>

            {result.dolencia.exclusions?.length > 0 && (
              <div className="bg-panel-card rounded-2xl border border-panel-border p-4">
                <div className="text-[10px] text-red-400 tracking-widest font-mono mb-2">EJERCICIOS EXCLUIDOS</div>
                <div className="space-y-2">
                  {result.dolencia.exclusions.map((ex, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/20">
                      <div className="text-sm text-slate-200">{ex.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{ex.motivo}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.dolencia.alternativas?.length > 0 && (
              <div className="bg-panel-card rounded-2xl border border-panel-border p-4">
                <div className="text-[10px] text-neon-green tracking-widest font-mono mb-2">ALTERNATIVAS SEGURAS</div>
                <div className="space-y-2">
                  {result.dolencia.alternativas.map((ex, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-neon-green/5 border border-neon-green/20">
                      <div className="text-sm text-slate-200">{ex.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{ex.motivo}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={apply}
              disabled={!!applying || !!applied}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-neon-orange/15 border border-neon-orange/40 text-neon-orange text-sm font-bold tracking-wide transition-panel disabled:opacity-60"
            >
              {applied === 'ailment' ? (
                <><Check size={16} /> RESTRICCIÓN ACTIVADA</>
              ) : applying === 'ailment' ? (
                <><Loader2 size={16} className="animate-spin" /> GUARDANDO...</>
              ) : (
                <><ShieldAlert size={16} /> ACTIVAR RESTRICCIÓN</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
