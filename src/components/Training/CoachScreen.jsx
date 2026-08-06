import { useState } from 'react'
import { useCoach } from '../../store/useCoach'
import {
  Sparkles, X, Send, AlertTriangle, Dumbbell, Check,
  ShieldAlert, ArrowRight, Loader2
} from 'lucide-react'

const MODE_TABS = [
  { id: 'rutina', label: 'Pegar Rutina', icon: Dumbbell, placeholder: 'Pegá tu rutina y contame por qué la armaste así. Ej: "Lunes: Hip Thrust 4x8, Copenhagen 3x20s porque tengo antecedente de pubalgia y quiero seguir fortaleciendo aductores..."' },
  { id: 'dolencia', label: 'Reportar Dolencia', icon: AlertTriangle, placeholder: 'Contame qué te duele o molesta. Ej: "Hoy me duelen los riñones" o "Tengo tensión en el aductor derecho desde ayer"' },
]

export default function CoachScreen({ onClose }) {
  const { loading, result, error, ask, clear, applyRoutine, applyAilment } = useCoach()
  const [mode, setMode] = useState('rutina')
  const [text, setText] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  const tab = MODE_TABS.find((t) => t.id === mode)

  const submit = () => {
    if (!text.trim()) return
    clear()
    ask(text)
  }

  const apply = async () => {
    setApplying(true)
    if (result.type === 'dolencia') await applyAilment(result)
    else await applyRoutine(result)
    setApplying(false)
    setApplied(true)
    setTimeout(onClose, 900)
  }

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
              onClick={() => { setMode(id); clear(); setApplied(false) }}
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
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
            <p className="text-xs text-red-400">
              {error === 'missing_api_key'
                ? 'El motor de IA no está configurado todavía (falta la API key en el servidor).'
                : 'No se pudo procesar. Intentá de nuevo en unos segundos.'}
            </p>
          </div>
        )}

        {/* Resultado — RUTINA */}
        {result && result.type === 'rutina' && (
          <div className="space-y-3">
            <div className="bg-panel-card rounded-2xl border panel-border-blue p-4 glow-blue">
              <div className="text-[10px] text-neon-blue tracking-widest font-mono mb-2">QUÉ BUSCAMOS HOY</div>
              {result.objetivo_del_dia && (
                <div className="text-sm font-bold text-slate-200 mb-2">{result.objetivo_del_dia}</div>
              )}
              <p className="text-xs text-slate-400 leading-relaxed">{result.explicacion}</p>
            </div>

            <div className="bg-panel-card rounded-2xl border border-panel-border p-4">
              <div className="text-[10px] text-slate-500 tracking-widest font-mono mb-3">
                EJERCICIOS INTERPRETADOS ({(result.ejercicios || []).length})
              </div>
              <div className="space-y-2">
                {(result.ejercicios || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-panel-bg border border-panel-border">
                    <Dumbbell size={13} className="text-neon-green shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-200 truncate">
                        {item.new_exercise?.name || item.exercise_id ? (item.new_exercise?.name ?? 'Ejercicio del catálogo') : '—'}
                      </div>
                      {item.new_exercise && (
                        <div className="text-[9px] text-neon-blue font-mono">NUEVO EN CATÁLOGO</div>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-500 shrink-0">{item.sets}×{item.reps}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={apply}
              disabled={applying || applied}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-neon-green/15 border border-neon-green/40 text-neon-green text-sm font-bold tracking-wide transition-panel disabled:opacity-60"
            >
              {applied ? (
                <><Check size={16} /> SESIÓN CREADA</>
              ) : applying ? (
                <><Loader2 size={16} className="animate-spin" /> ARMANDO SESIÓN...</>
              ) : (
                <><ArrowRight size={16} /> INICIAR ESTA SESIÓN</>
              )}
            </button>
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
              disabled={applying || applied}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-neon-orange/15 border border-neon-orange/40 text-neon-orange text-sm font-bold tracking-wide transition-panel disabled:opacity-60"
            >
              {applied ? (
                <><Check size={16} /> RESTRICCIÓN ACTIVADA</>
              ) : applying ? (
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
