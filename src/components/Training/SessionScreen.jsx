import { useState, useEffect, useRef } from 'react'
import { useSession } from '../../store/useSession'
import { useCatalog, filterByProtocol } from '../../store/useCatalog'
import { useAilments, excludedByAilments } from '../../store/useAilments'
import {
  Play, Square, Plus, X, Check, Timer, Search,
  ChevronDown, ChevronUp, Trash2, Flag
} from 'lucide-react'

const PROTOCOL_LABEL = {
  standard: { label: 'ESTÁNDAR', color: 'neon-green' },
  bypass: { label: 'BYPASS', color: 'neon-orange' },
  neural_priming: { label: 'PRIMING', color: 'neon-blue' },
}

function formatElapsed(startedAt) {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(startedAt)) / 1000))
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/* ---------- Timer de descanso flotante ---------- */
function RestTimer({ rest, onDone }) {
  const [left, setLeft] = useState(rest.seconds)

  useEffect(() => {
    setLeft(rest.seconds)
    const id = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) { clearInterval(id); onDone(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [rest.key])

  const pct = rest.seconds > 0 ? (left / rest.seconds) * 100 : 0

  return (
    <div className="fixed bottom-16 inset-x-0 z-40 pb-safe">
      <div className="max-w-lg mx-auto px-4 pb-2">
        <div className="bg-panel-surface border border-neon-blue/40 rounded-2xl p-3 shadow-lg shadow-black/50">
          <div className="flex items-center gap-3">
            <Timer size={18} className="text-neon-blue shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-slate-500 tracking-wider truncate">DESCANSO — {rest.name}</div>
              <div className="w-full bg-panel-border rounded-full h-1.5 mt-1.5">
                <div
                  className="bg-neon-blue h-1.5 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold font-mono text-neon-blue shrink-0">{left}s</span>
            <button onClick={onDone} className="p-1.5 text-slate-500 hover:text-slate-300 shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Fila de serie ---------- */
function SetRow({ log, isTime, onComplete, onUncomplete, onUpdate }) {
  const [weight, setWeight] = useState(log.weight_kg ?? '')
  const [amount, setAmount] = useState((isTime ? log.seconds : log.reps) ?? '')

  const amountKey = isTime ? 'seconds' : 'reps'

  const flush = () => {
    const patch = {}
    patch.weight_kg = weight === '' ? null : Number(weight)
    patch[amountKey] = amount === '' ? null : Number(amount)
    return patch
  }

  return (
    <div className={`flex items-center gap-2 p-2 rounded-xl border transition-panel ${
      log.completed
        ? 'bg-neon-green/5 border-neon-green/25'
        : 'bg-panel-bg border-panel-border'
    }`}>
      <span className="w-6 text-center text-xs font-mono text-slate-600 shrink-0">{log.set_number}</span>

      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={() => onUpdate(flush())}
            placeholder="—"
            disabled={log.completed}
            className="w-full bg-panel-card border border-panel-border rounded-lg pl-2 pr-7 py-2.5 text-sm font-mono text-center text-slate-200 focus:border-neon-green/50 focus:outline-none disabled:opacity-60"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-600">kg</span>
        </div>
        <span className="text-slate-700 text-xs">×</span>
        <div className="flex-1 relative">
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => onUpdate(flush())}
            placeholder="—"
            disabled={log.completed}
            className="w-full bg-panel-card border border-panel-border rounded-lg pl-2 pr-7 py-2.5 text-sm font-mono text-center text-slate-200 focus:border-neon-green/50 focus:outline-none disabled:opacity-60"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-600">{isTime ? 's' : 'rep'}</span>
        </div>
      </div>

      <button
        onClick={() => log.completed ? onUncomplete() : onComplete(flush())}
        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-panel shrink-0 ${
          log.completed
            ? 'bg-neon-green border-neon-green text-panel-bg'
            : 'bg-panel-card border-panel-border text-slate-500 active:border-neon-green/50'
        }`}
      >
        <Check size={16} strokeWidth={3} />
      </button>
    </div>
  )
}

/* ---------- Card de ejercicio en sesión ---------- */
function SessionExercise({ exercise, logs, onCompleteSet, onUncompleteSet, onUpdateSet, onAddSet, onRemove }) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const isTime = exercise.measure_type === 'seconds'
  const done = logs.filter((l) => l.completed).length

  return (
    <div className="bg-panel-card rounded-2xl border border-panel-border p-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-200 truncate">{exercise.name}</div>
          <div className="text-[10px] text-slate-600 font-mono">
            {done}/{logs.length} SERIES · descanso {exercise.rest_seconds}s
            {exercise.tempo ? ` · ${exercise.tempo}` : ''}
          </div>
        </div>
        {confirmRemove ? (
          <div className="flex gap-1.5 shrink-0">
            <button onClick={onRemove} className="text-[10px] px-2 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 font-bold">QUITAR</button>
            <button onClick={() => setConfirmRemove(false)} className="text-[10px] px-2 py-1.5 rounded-lg border border-panel-border text-slate-400">NO</button>
          </div>
        ) : (
          <button onClick={() => setConfirmRemove(true)} className="p-1.5 text-slate-700 hover:text-red-400 shrink-0">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {logs.map((log) => (
          <SetRow
            key={log.id}
            log={log}
            isTime={isTime}
            onComplete={(values) => onCompleteSet(log.id, values, exercise)}
            onUncomplete={() => onUncompleteSet(log.id)}
            onUpdate={(patch) => onUpdateSet(log.id, patch)}
          />
        ))}
      </div>

      <button
        onClick={() => onAddSet(exercise.id)}
        className="w-full mt-2 py-2 rounded-xl border border-dashed border-panel-border text-xs text-slate-500 hover:text-neon-green hover:border-neon-green/30 transition-panel"
      >
        + Serie
      </button>
    </div>
  )
}

/* ---------- Selector de ejercicios ---------- */
function ExercisePicker({ protocol, excludeIds, onPick, onClose }) {
  const { modules, exercises } = useCatalog()
  const { ailments } = useAilments()
  const [search, setSearch] = useState('')
  const [openModule, setOpenModule] = useState(null)

  const excludedIds = excludedByAilments(ailments)
  const available = filterByProtocol(exercises, protocol, excludedIds).filter((e) => !excludeIds.includes(e.id))
  const filtered = search.trim()
    ? available.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    : available

  return (
    <div className="fixed inset-0 z-50 bg-panel-bg/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        <div className="flex items-center gap-3 mb-4 sticky top-0 bg-panel-bg py-2 z-10">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="w-full bg-panel-card border border-panel-border rounded-xl pl-9 pr-3 py-3 text-sm text-slate-200 focus:border-neon-green/50 focus:outline-none"
            />
          </div>
          <button onClick={onClose} className="p-3 rounded-xl bg-panel-card border border-panel-border text-slate-400">
            <X size={16} />
          </button>
        </div>

        {search.trim() ? (
          <div className="space-y-2">
            {filtered.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onPick(ex)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-panel-card border border-panel-border text-left active:border-neon-green/40 transition-panel"
              >
                <Plus size={14} className="text-neon-green shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-200 truncate">{ex.name}</div>
                  <div className="text-[10px] text-slate-600 font-mono">{ex.default_sets}×{ex.default_reps}</div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-6">Sin resultados</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {modules.map((mod) => {
              const modExs = filtered.filter((e) => e.module === mod.id)
              if (modExs.length === 0) return null
              const open = openModule === mod.id
              return (
                <div key={mod.id} className="bg-panel-card rounded-2xl border border-panel-border overflow-hidden">
                  <button
                    onClick={() => setOpenModule(open ? null : mod.id)}
                    className="w-full flex items-center gap-3 p-3.5 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-slate-200">{mod.name}</span>
                      <span className="text-xs text-slate-600 ml-2">{mod.subtitle}</span>
                    </div>
                    <span className="text-xs font-mono text-neon-green">{modExs.length}</span>
                    {open ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
                  </button>
                  {open && (
                    <div className="px-2 pb-2 space-y-1.5">
                      {modExs.map((ex) => (
                        <button
                          key={ex.id}
                          onClick={() => onPick(ex)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-panel-bg border border-panel-border text-left active:border-neon-green/40 transition-panel"
                        >
                          <Plus size={13} className="text-neon-green shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-slate-300 truncate">{ex.name}</div>
                            <div className="text-[10px] text-slate-600 font-mono">{ex.default_sets}×{ex.default_reps}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Pantalla de sesión activa ---------- */
export default function SessionScreen() {
  const { session, logs, addExercise, addSet, updateSet, completeSet, uncompleteSet, removeExercise, finish, abandon } = useSession()
  const { exercises } = useCatalog()
  const [elapsed, setElapsed] = useState(() => formatElapsed(session.started_at))
  const [showPicker, setShowPicker] = useState(false)
  const [rest, setRest] = useState(null)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const restKey = useRef(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed(formatElapsed(session.started_at)), 1000)
    return () => clearInterval(id)
  }, [session.started_at])

  const proto = PROTOCOL_LABEL[session.protocol_id] || PROTOCOL_LABEL.standard

  // Agrupar logs por ejercicio (en orden de inserción)
  const exerciseIds = [...new Set(logs.map((l) => l.exercise_id))]
  const byExercise = exerciseIds.map((id) => ({
    exercise: exercises.find((e) => e.id === id),
    logs: logs.filter((l) => l.exercise_id === id),
  })).filter((g) => g.exercise)

  const completedCount = logs.filter((l) => l.completed).length
  const volume = logs
    .filter((l) => l.completed && l.weight_kg && l.reps)
    .reduce((sum, l) => sum + l.weight_kg * l.reps, 0)

  const handleCompleteSet = (logId, values, exercise) => {
    completeSet(logId, values)
    if (exercise.rest_seconds > 0) {
      restKey.current += 1
      setRest({ seconds: exercise.rest_seconds, name: exercise.name, key: restKey.current })
    }
  }

  return (
    <div className="space-y-4">
      {/* Header de sesión */}
      <div className="bg-panel-card rounded-2xl border panel-border-green p-4 glow-green">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs text-neon-green tracking-widest font-mono font-bold">SESIÓN ACTIVA</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded border font-mono tracking-wider border-${proto.color}/30 bg-${proto.color}/10 text-${proto.color}`}>
            {proto.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'TIEMPO', value: elapsed },
            { label: 'SERIES', value: completedCount },
            { label: 'VOLUMEN', value: volume > 0 ? `${Math.round(volume)}kg` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-panel-bg rounded-xl p-2.5 text-center border border-panel-border">
              <div className="text-lg font-bold font-mono text-neon-green leading-tight">{value}</div>
              <div className="text-[9px] text-slate-600 tracking-widest mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ejercicios de la sesión */}
      {byExercise.length === 0 ? (
        <p className="text-xs text-slate-600 text-center py-4">
          Agregá el primer ejercicio para empezar a registrar
        </p>
      ) : (
        <div className="space-y-3">
          {byExercise.map(({ exercise, logs: exLogs }) => (
            <SessionExercise
              key={exercise.id}
              exercise={exercise}
              logs={exLogs}
              onCompleteSet={handleCompleteSet}
              onUncompleteSet={uncompleteSet}
              onUpdateSet={updateSet}
              onAddSet={addSet}
              onRemove={() => removeExercise(exercise.id)}
            />
          ))}
        </div>
      )}

      {/* Agregar ejercicio */}
      <button
        onClick={() => setShowPicker(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm font-bold tracking-wide transition-panel"
      >
        <Plus size={16} />
        AGREGAR EJERCICIO
      </button>

      {/* Finalizar / abandonar */}
      {confirmEnd ? (
        <div className="bg-panel-card rounded-2xl border border-panel-border p-4 space-y-2">
          <p className="text-xs text-slate-400 text-center mb-3">
            {completedCount > 0
              ? `¿Cerrar sesión con ${completedCount} series registradas?`
              : 'No registraste ninguna serie. ¿Descartar la sesión?'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { completedCount > 0 ? finish() : abandon() }}
              className="py-3 rounded-xl bg-neon-green/15 border border-neon-green/40 text-neon-green text-sm font-bold"
            >
              {completedCount > 0 ? 'FINALIZAR' : 'DESCARTAR'}
            </button>
            <button
              onClick={() => setConfirmEnd(false)}
              className="py-3 rounded-xl bg-panel-bg border border-panel-border text-slate-400 text-sm font-medium"
            >
              Seguir
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmEnd(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-panel-card border border-panel-border text-slate-400 text-sm font-medium transition-panel"
        >
          <Flag size={14} />
          Terminar sesión
        </button>
      )}

      {/* Timer de descanso */}
      {rest && <RestTimer rest={rest} onDone={() => setRest(null)} />}

      {/* Picker */}
      {showPicker && (
        <ExercisePicker
          protocol={session.protocol_id}
          excludeIds={exerciseIds}
          onPick={(ex) => { addExercise(ex); setShowPicker(false) }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
