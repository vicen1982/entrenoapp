import { useStore } from '../../store/useStore'
import exercisesData from '../../data/exercises.json'
import { Droplets, Beef, Ban, Moon, Pill, Fish, Shield, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react'

const ICON_MAP = {
  droplets: Droplets,
  beef: Beef,
  ban: Ban,
  moon: Moon,
  pill: Pill,
  fish: Fish,
}

export default function Firewall() {
  const nutritionChecklist = useStore((s) => s.nutritionChecklist)
  const toggleNutrition = useStore((s) => s.toggleNutrition)
  const alerts = useStore((s) => s.alerts)
  const resetDailyChecklist = useStore((s) => s.resetDailyChecklist)
  const getNutritionScore = useStore((s) => s.getNutritionScore)

  const score = getNutritionScore()
  const checklist = exercisesData.nutritionChecklist

  const critical = checklist.filter((c) => c.critical)
  const optional = checklist.filter((c) => !c.critical)
  const criticalDone = critical.filter((c) => nutritionChecklist[c.id]).length
  const optionalDone = optional.filter((c) => nutritionChecklist[c.id]).length

  const scoreColor = score >= 80 ? 'neon-green' : score >= 50 ? 'yellow-400' : 'neon-orange'
  const scoreLabel = score >= 80 ? 'FIREWALL ACTIVO' : score >= 50 ? 'PARCIAL' : 'COMPROMETIDO'

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className={`bg-panel-card rounded-lg p-5 panel-border transition-panel ${score >= 80 ? 'glow-green' : score < 50 ? 'glow-orange' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={14} className={`text-${scoreColor}`} />
            <span className="text-xs text-slate-500 tracking-widest">FIREWALL NUTRICIONAL</span>
          </div>
          <span className="text-xs text-slate-600 tracking-wider">{today}</span>
        </div>

        <div className="flex items-end gap-4 mb-4">
          <span className={`text-6xl font-bold text-${scoreColor} leading-none`}>{score}</span>
          <div className="pb-2 space-y-1">
            <div className="text-lg text-slate-500">%</div>
            <div className={`text-xs font-bold tracking-widest text-${scoreColor}`}>{scoreLabel}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-panel-border rounded-full h-1.5 mb-2">
          <div
            className={`bg-${scoreColor} h-1.5 rounded-full transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>{criticalDone}/{critical.length} críticos completados</span>
          <button
            onClick={resetDailyChecklist}
            className="flex items-center gap-1 hover:text-slate-300 transition-panel"
          >
            <RefreshCw size={10} />
            RESET
          </button>
        </div>
      </div>

      {/* Diet fail warning */}
      {alerts.dietFail && (
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-red-400 tracking-wider mb-1">
                FIREWALL COMPROMETIDO
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingesta de harinas/azúcar detectada. Protocolo de mitigación activado.
              </p>
              <div className="mt-3 bg-panel-card rounded p-3 border border-red-500/20">
                <div className="text-xs font-bold text-red-400 tracking-wider mb-2">
                  ⚡ FLUSH METABÓLICO — MAÑANA
                </div>
                <ul className="space-y-1">
                  {[
                    '15 min bici estática — Zona 1 (50-60% FCM)',
                    '10 min movilidad de cadera y core',
                    'Objetivo: clearance de insulina residual',
                    'Hidratación extra: +500ml agua',
                  ].map((item, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-red-400 shrink-0">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical checklist */}
      <div className="bg-panel-card rounded-lg p-4 panel-border">
        <div className="text-xs text-slate-500 tracking-widest mb-3 flex items-center gap-2">
          <TrendingUp size={12} />
          PARÁMETROS CRÍTICOS ({criticalDone}/{critical.length})
        </div>
        <div className="space-y-2">
          {critical.map((item) => {
            const Icon = ICON_MAP[item.icon] || Shield
            const isChecked = nutritionChecklist[item.id]
            const isBad = item.id === 'no_sugar' // Si está sin marcar = fallo
            const showBad = item.id === 'no_sugar' && !isChecked

            return (
              <button
                key={item.id}
                onClick={() => toggleNutrition(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-panel
                  ${isChecked
                    ? 'bg-neon-green/5 border-neon-green/25 text-neon-green'
                    : showBad
                    ? 'bg-red-500/5 border-red-500/20 text-red-400'
                    : 'bg-panel-bg border-panel-border text-slate-500 hover:border-slate-600'
                  }`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="text-xs font-medium tracking-wider flex-1">{item.label}</span>
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-panel shrink-0 ${
                  isChecked
                    ? 'bg-neon-green border-neon-green text-panel-bg'
                    : 'border-panel-border'
                }`}>
                  {isChecked && <span className="text-xs font-bold">✓</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Optional checklist */}
      <div className="bg-panel-card rounded-lg p-4 panel-border">
        <div className="text-xs text-slate-500 tracking-widest mb-3">
          SUPLEMENTACIÓN ({optionalDone}/{optional.length})
        </div>
        <div className="space-y-2">
          {optional.map((item) => {
            const Icon = ICON_MAP[item.icon] || Shield
            const isChecked = nutritionChecklist[item.id]
            return (
              <button
                key={item.id}
                onClick={() => toggleNutrition(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-panel
                  ${isChecked
                    ? 'bg-neon-blue/5 border-neon-blue/20 text-neon-blue'
                    : 'bg-panel-bg border-panel-border text-slate-500 hover:border-slate-600'
                  }`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="text-xs font-medium tracking-wider flex-1">{item.label}</span>
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-panel shrink-0 ${
                  isChecked ? 'bg-neon-blue border-neon-blue text-panel-bg' : 'border-panel-border'
                }`}>
                  {isChecked && <span className="text-xs font-bold">✓</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recovery tips based on state */}
      <div className="bg-panel-card rounded-lg p-4 panel-border">
        <div className="text-xs text-slate-500 tracking-widest mb-3">DIRECTIVAS DE RECUPERACIÓN</div>
        <div className="space-y-2">
          {[
            { label: 'Crioterapia piernas post-entreno (10 min)', active: true },
            { label: 'Rodillo de espuma — sóleo y fascia plantar', active: true },
            { label: 'Elevación de piernas 15 min pre-sueño', active: true },
            { label: 'Sin alcohol (inflamación de ligamentos +40%)', active: true },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
              <span className="text-neon-green mt-0.5 shrink-0">›</span>
              <span>{tip.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
