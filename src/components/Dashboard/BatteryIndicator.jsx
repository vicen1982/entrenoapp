import { useStore } from '../../store/useStore'
import { BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, Minus, Plus } from 'lucide-react'

const getLevel = (pct) => {
  if (pct >= 80) return { label: 'ÓPTIMO', color: 'neon-green', glow: 'glow-green', textGlow: 'text-glow-green', desc: 'Sistema listo para carga máxima' }
  if (pct >= 60) return { label: 'BUENO', color: 'neon-green', glow: 'glow-green', textGlow: 'text-glow-green', desc: 'Entrenamiento normal permitido' }
  if (pct >= 40) return { label: 'PRECAUCIÓN', color: 'yellow-400', glow: '', textGlow: '', desc: 'Reducir volumen un 20%' }
  if (pct >= 20) return { label: 'BAJO', color: 'neon-orange', glow: 'glow-orange', textGlow: 'text-glow-orange', desc: 'Solo recuperación activa' }
  return { label: 'CRÍTICO', color: 'red-500', glow: 'glow-orange', textGlow: 'text-glow-orange', desc: '⚠ DESCANSO OBLIGATORIO' }
}

const BatteryIcon = ({ pct, size = 24 }) => {
  const props = { size, strokeWidth: 1.5 }
  if (pct >= 80) return <BatteryFull {...props} />
  if (pct >= 50) return <BatteryMedium {...props} />
  if (pct >= 20) return <BatteryLow {...props} />
  return <BatteryWarning {...props} />
}

export default function BatteryIndicator() {
  const sncBattery = useStore((s) => s.sncBattery)
  const setSNCBattery = useStore((s) => s.setSNCBattery)
  const level = getLevel(sncBattery)

  const segments = 20
  const filled = Math.round((sncBattery / 100) * segments)

  return (
    <div className={`relative bg-panel-card rounded-lg p-5 panel-border overflow-hidden transition-panel ${level.glow}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 tracking-widest">SNC BATTERY</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
        </div>
        <div className={`flex items-center gap-1.5 text-${level.color} ${level.textGlow}`}>
          <BatteryIcon pct={sncBattery} size={16} />
          <span className="text-xs font-bold tracking-wider">{level.label}</span>
        </div>
      </div>

      {/* Percentage */}
      <div className="flex items-end gap-3 mb-4">
        <span className={`text-6xl font-bold text-${level.color} ${level.textGlow} leading-none`}>
          {sncBattery}
        </span>
        <div className="pb-2">
          <div className="text-xl text-slate-500">%</div>
        </div>
      </div>

      {/* Segmented bar */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filled
          const segColor = i < 8 ? 'bg-red-500' : i < 12 ? 'bg-yellow-400' : 'bg-neon-green'
          return (
            <div
              key={i}
              className={`flex-1 h-2 rounded-sm transition-all duration-300 ${
                isFilled ? segColor : 'bg-panel-border'
              }`}
            />
          )
        })}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 mb-4">{level.desc}</p>

      {/* Manual adjust */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600 tracking-wider flex-1">AJUSTE MANUAL</span>
        <button
          onClick={() => setSNCBattery(Math.max(0, sncBattery - 10))}
          className="p-1.5 rounded bg-panel-border hover:bg-panel-surface text-slate-400 hover:text-white transition-panel"
        >
          <Minus size={12} />
        </button>
        <button
          onClick={() => setSNCBattery(Math.min(100, sncBattery + 10))}
          className="p-1.5 rounded bg-panel-border hover:bg-panel-surface text-slate-400 hover:text-white transition-panel"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Scan line decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-green to-transparent top-1/3" />
      </div>
    </div>
  )
}
