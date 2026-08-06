import { useEffect, useState } from 'react'
import { useNutrition, dailyTotals } from '../../store/useNutrition'
import Firewall from './Firewall'
import { Flame, Plus, Trash2, X, UtensilsCrossed, ChevronDown, ChevronUp } from 'lucide-react'

const MEAL_TYPES = [
  { id: 'desayuno', label: 'Desayuno' },
  { id: 'almuerzo', label: 'Almuerzo' },
  { id: 'merienda', label: 'Merienda' },
  { id: 'cena', label: 'Cena' },
  { id: 'snack', label: 'Snack' },
]

const inputCls = 'w-full bg-panel-bg border border-panel-border rounded-lg px-2 py-2.5 text-sm font-mono text-center text-slate-200 focus:border-neon-green/50 focus:outline-none'

function QuickAddMeal({ onClose }) {
  const addMeal = useNutrition((s) => s.addMeal)
  const [mealType, setMealType] = useState('almuerzo')
  const [description, setDescription] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [calories, setCalories] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const submit = async () => {
    if (!description.trim()) { setError('Poné una descripción'); return }
    setSaving(true)
    const p = Number(protein) || 0
    const c = Number(carbs) || 0
    const f = Number(fat) || 0
    // Si no cargó calorías, se calculan de los macros (4/4/9)
    const kcal = calories !== '' ? Number(calories) : Math.round(p * 4 + c * 4 + f * 9)

    const err = await addMeal({
      meal_type: mealType,
      description: description.trim(),
      protein_g: p,
      carbs_g: c,
      fat_g: f,
      calories: kcal,
    })
    setSaving(false)
    if (err) setError(err.message)
    else onClose()
  }

  return (
    <div className="space-y-3 border-t border-panel-border pt-3 mt-3">
      <div className="flex flex-wrap gap-1.5">
        {MEAL_TYPES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setMealType(id)}
            className={`text-[11px] px-3 py-1.5 rounded-full border transition-panel ${
              mealType === id
                ? 'bg-neon-green/15 border-neon-green/40 text-neon-green font-semibold'
                : 'bg-panel-bg border-panel-border text-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        autoFocus
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Qué comiste — ej: pollo con arroz y ensalada"
        className="w-full bg-panel-bg border border-panel-border rounded-xl px-3 py-3 text-sm text-slate-200 focus:border-neon-green/50 focus:outline-none"
      />

      <div className="grid grid-cols-4 gap-2">
        {[
          ['PROT (g)', protein, setProtein],
          ['CARB (g)', carbs, setCarbs],
          ['GRASA (g)', fat, setFat],
          ['KCAL', calories, setCalories],
        ].map(([label, value, setter]) => (
          <div key={label}>
            <div className="text-[9px] text-slate-600 tracking-wider font-mono text-center mb-1">{label}</div>
            <input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={label === 'KCAL' ? 'auto' : '0'}
              className={inputCls}
            />
          </div>
        ))}
      </div>

      {error && <div className="text-xs text-red-400 text-center">{error}</div>}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={submit}
          disabled={saving}
          className="py-3 rounded-xl bg-neon-green/15 border border-neon-green/40 text-neon-green text-sm font-bold disabled:opacity-50"
        >
          {saving ? 'GUARDANDO...' : 'REGISTRAR'}
        </button>
        <button onClick={onClose} className="py-3 rounded-xl bg-panel-bg border border-panel-border text-slate-400 text-sm">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function FuelScreen() {
  const { meals, loading, load, deleteMeal } = useNutrition()
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showChecklist, setShowChecklist] = useState(false)

  useEffect(() => { load() }, [])

  const totals = dailyTotals(meals)
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()

  return (
    <div className="space-y-4">
      {/* Totales del día */}
      <div className="bg-panel-card rounded-2xl border border-panel-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-neon-orange" />
            <span className="text-xs text-slate-500 tracking-widest font-mono">COMBUSTIBLE HOY</span>
          </div>
          <span className="text-[10px] text-slate-600 tracking-wider">{today}</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'KCAL', value: Math.round(totals.calories), color: 'text-neon-orange' },
            { label: 'PROT', value: `${Math.round(totals.protein)}g`, color: 'text-neon-green' },
            { label: 'CARB', value: `${Math.round(totals.carbs)}g`, color: 'text-neon-blue' },
            { label: 'GRASA', value: `${Math.round(totals.fat)}g`, color: 'text-yellow-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-panel-bg rounded-xl p-2.5 text-center border border-panel-border">
              <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
              <div className="text-[9px] text-slate-600 tracking-widest mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Agregar comida */}
      <div className="bg-panel-card rounded-2xl border border-panel-border p-4">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm font-bold tracking-wide transition-panel"
          >
            <Plus size={16} />
            REGISTRAR COMIDA
          </button>
        ) : (
          <>
            <div className="text-xs text-slate-500 tracking-widest font-mono">NUEVA COMIDA</div>
            <QuickAddMeal onClose={() => setShowAdd(false)} />
          </>
        )}
      </div>

      {/* Comidas del día */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-600 font-mono animate-pulse">CARGANDO...</div>
      ) : meals.length > 0 ? (
        <div className="space-y-2">
          {meals.map((meal) => (
            <div key={meal.id} className="flex items-center gap-3 p-3 rounded-2xl bg-panel-card border border-panel-border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-panel-border bg-panel-bg text-slate-500 tracking-wider uppercase font-mono shrink-0">
                    {meal.meal_type}
                  </span>
                  <span className="text-sm text-slate-200 truncate">{meal.description}</span>
                </div>
                <div className="text-[10px] text-slate-600 font-mono mt-1">
                  {Math.round(meal.calories)}kcal · P{Math.round(meal.protein_g)} C{Math.round(meal.carbs_g)} G{Math.round(meal.fat_g)}
                </div>
              </div>
              {confirmDelete === meal.id ? (
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => { deleteMeal(meal.id); setConfirmDelete(null) }}
                    className="text-[10px] px-2 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 font-bold"
                  >
                    BORRAR
                  </button>
                  <button onClick={() => setConfirmDelete(null)} className="text-[10px] px-2 py-1.5 rounded-lg border border-panel-border text-slate-400">
                    NO
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(meal.id)} className="p-1.5 text-slate-700 hover:text-red-400 transition-panel shrink-0">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <UtensilsCrossed size={20} className="text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-600">Sin comidas registradas hoy</p>
        </div>
      )}

      {/* Firewall (checklist) plegable */}
      <div className="bg-panel-card rounded-2xl border border-panel-border overflow-hidden">
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="text-xs text-slate-500 tracking-widest font-mono">FIREWALL NUTRICIONAL — CHECKLIST</span>
          {showChecklist ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
        </button>
      </div>
      {showChecklist && <Firewall />}
    </div>
  )
}
