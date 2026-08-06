import { useState } from 'react'
import { useCatalog } from '../../store/useCatalog'
import { useStore } from '../../store/useStore'
import {
  Database, Plus, Trash2, RefreshCw, ChevronDown, ChevronUp,
  Check, X, Wrench
} from 'lucide-react'

const MUSCLE_OPTIONS = [
  'cuadriceps', 'isquiotibiales', 'gluteos', 'aductores', 'abductores',
  'gemelos', 'soleo', 'core', 'oblicuos', 'transverso', 'lumbar',
  'dorsales', 'trapecio', 'romboides', 'pectoral', 'deltoides',
  'biceps', 'triceps', 'antebrazos', 'psoas', 'cardio',
]

const EMPTY_FORM = {
  name: '',
  module: 'piernas',
  muscles: [],
  measure_type: 'reps',
  default_sets: 3,
  default_reps: '10',
  tempo: '',
  rest_seconds: 60,
  notes: '',
  rehab_priority: 'normal',
  soleo_load: false,
  priming_ok: false,
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    + '_' + Date.now().toString(36)
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] text-slate-500 tracking-widest font-mono block mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-panel-bg border border-panel-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-neon-green/50 focus:outline-none'

function AddExerciseForm({ modules, onClose }) {
  const addExercise = useCatalog((s) => s.addExercise)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const toggleMuscle = (m) =>
    set('muscles', form.muscles.includes(m) ? form.muscles.filter((x) => x !== m) : [...form.muscles, m])

  const submit = async () => {
    if (!form.name.trim() || form.muscles.length === 0) {
      setResult({ ok: false, msg: 'Nombre y al menos 1 músculo son obligatorios' })
      return
    }
    setSaving(true)
    const error = await addExercise({
      ...form,
      slug: slugify(form.name),
      default_sets: Number(form.default_sets) || 3,
      rest_seconds: Number(form.rest_seconds) || 60,
    })
    setSaving(false)
    if (error) {
      setResult({ ok: false, msg: error.message })
    } else {
      setResult({ ok: true, msg: 'Ejercicio agregado al catálogo' })
      setForm(EMPTY_FORM)
      setTimeout(() => { setResult(null); onClose() }, 1200)
    }
  }

  return (
    <div className="space-y-3 border-t border-panel-border pt-4 mt-4">
      <Field label="NOMBRE *">
        <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Sentadilla Frontal" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="MÓDULO">
          <select className={inputCls} value={form.module} onChange={(e) => set('module', e.target.value)}>
            {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
        <Field label="MEDICIÓN">
          <select className={inputCls} value={form.measure_type} onChange={(e) => set('measure_type', e.target.value)}>
            <option value="reps">Repeticiones</option>
            <option value="seconds">Segundos</option>
          </select>
        </Field>
      </div>

      <Field label={`MÚSCULOS * (${form.muscles.length})`}>
        <div className="flex flex-wrap gap-1.5">
          {MUSCLE_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => toggleMuscle(m)}
              className={`text-[10px] px-2 py-1 rounded-full border transition-panel ${
                form.muscles.includes(m)
                  ? 'bg-neon-green/15 border-neon-green/40 text-neon-green'
                  : 'bg-panel-bg border-panel-border text-slate-500'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="SERIES">
          <input type="number" className={inputCls} value={form.default_sets} onChange={(e) => set('default_sets', e.target.value)} />
        </Field>
        <Field label={form.measure_type === 'seconds' ? 'DURACIÓN' : 'REPS'}>
          <input className={inputCls} value={form.default_reps} onChange={(e) => set('default_reps', e.target.value)} placeholder={form.measure_type === 'seconds' ? '30s' : '8-10'} />
        </Field>
        <Field label="DESCANSO (s)">
          <input type="number" className={inputCls} value={form.rest_seconds} onChange={(e) => set('rest_seconds', e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="TEMPO">
          <input className={inputCls} value={form.tempo} onChange={(e) => set('tempo', e.target.value)} placeholder="Ej: 3-1-1" />
        </Field>
        <Field label="PRIORIDAD REHAB">
          <select className={inputCls} value={form.rehab_priority} onChange={(e) => set('rehab_priority', e.target.value)}>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </Field>
      </div>

      <Field label="NOTAS TÉCNICAS">
        <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => set('soleo_load', !form.soleo_load)}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-panel ${
            form.soleo_load
              ? 'bg-neon-orange/10 border-neon-orange/40 text-neon-orange'
              : 'bg-panel-bg border-panel-border text-slate-500'
          }`}
        >
          {form.soleo_load ? <Check size={12} /> : <X size={12} />}
          Carga Sóleo
        </button>
        <button
          onClick={() => set('priming_ok', !form.priming_ok)}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-panel ${
            form.priming_ok
              ? 'bg-neon-blue/10 border-neon-blue/40 text-neon-blue'
              : 'bg-panel-bg border-panel-border text-slate-500'
          }`}
        >
          {form.priming_ok ? <Check size={12} /> : <X size={12} />}
          Apto Priming
        </button>
      </div>

      {result && (
        <div className={`text-xs p-2 rounded-lg text-center ${result.ok ? 'bg-neon-green/10 text-neon-green' : 'bg-red-500/10 text-red-400'}`}>
          {result.msg}
        </div>
      )}

      <button
        onClick={submit}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-neon-green/15 border border-neon-green/40 text-neon-green text-sm font-bold tracking-wider transition-panel disabled:opacity-50"
      >
        {saving ? 'GUARDANDO...' : 'AGREGAR AL CATÁLOGO'}
      </button>
    </div>
  )
}

export default function SystemScreen() {
  const { modules, exercises, loaded, error, deleteExercise } = useCatalog()
  const resetDailyChecklist = useStore((s) => s.resetDailyChecklist)
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const customExercises = exercises.filter((e) => e.is_custom)
  const catalogReady = loaded && !error && exercises.length > 0

  return (
    <div className="space-y-4">
      {/* Mantenimiento del catálogo */}
      <div className="bg-panel-card rounded-2xl p-4 border border-panel-border">
        <div className="flex items-center gap-2 mb-3">
          <Database size={14} className="text-neon-green" />
          <span className="text-xs text-slate-500 tracking-widest font-mono">MANTENIMIENTO DEL CATÁLOGO</span>
        </div>

        {!catalogReady ? (
          <p className="text-xs text-slate-500">
            Catálogo no inicializado. Ejecutá <span className="font-mono text-slate-300">supabase/phase1.sql</span> en Supabase.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'MÓDULOS', value: modules.length },
                { label: 'EJERCICIOS', value: exercises.length },
                { label: 'PROPIOS', value: customExercises.length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-panel-bg rounded-xl p-3 text-center border border-panel-border">
                  <div className="text-xl font-bold font-mono text-neon-green">{value}</div>
                  <div className="text-[10px] text-slate-600 tracking-widest mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-panel ${
                showForm
                  ? 'bg-panel-bg border-panel-border text-slate-400'
                  : 'bg-neon-green/10 border-neon-green/30 text-neon-green'
              }`}
            >
              {showForm ? <><ChevronUp size={14} /> Cerrar formulario</> : <><Plus size={14} /> Añadir Ejercicio</>}
            </button>

            {showForm && <AddExerciseForm modules={modules} onClose={() => setShowForm(false)} />}
          </>
        )}
      </div>

      {/* Ejercicios propios */}
      {customExercises.length > 0 && (
        <div className="bg-panel-card rounded-2xl p-4 border border-panel-border">
          <div className="text-xs text-slate-500 tracking-widest font-mono mb-3">EJERCICIOS PROPIOS</div>
          <div className="space-y-2">
            {customExercises.map((ex) => (
              <div key={ex.id} className="flex items-center gap-3 p-3 rounded-xl bg-panel-bg border border-panel-border">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-200 truncate">{ex.name}</div>
                  <div className="text-[10px] text-slate-600 font-mono">{ex.module} · {ex.default_sets}×{ex.default_reps}</div>
                </div>
                {confirmDelete === ex.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={async () => { await deleteExercise(ex.id); setConfirmDelete(null) }}
                      className="text-[10px] px-2 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 font-bold"
                    >
                      BORRAR
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-[10px] px-2 py-1.5 rounded-lg bg-panel-card border border-panel-border text-slate-400"
                    >
                      NO
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(ex.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-panel">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sistema */}
      <div className="bg-panel-card rounded-2xl p-4 border border-panel-border">
        <div className="flex items-center gap-2 mb-3">
          <Wrench size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500 tracking-widest font-mono">SISTEMA</span>
        </div>
        <button
          onClick={resetDailyChecklist}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-panel-bg border border-panel-border text-slate-400 text-sm font-medium transition-panel hover:border-neon-orange/30 hover:text-neon-orange"
        >
          <RefreshCw size={14} />
          Reset checklist diaria y alertas
        </button>
        <p className="text-[10px] text-slate-700 text-center mt-4 tracking-widest font-mono">
          ENGANCHE_OS v3.0.0 — FASE 1
        </p>
      </div>
    </div>
  )
}
