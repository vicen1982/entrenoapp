import { useEffect, useMemo, useState } from 'react'
import { useCatalog } from '../../store/useCatalog'
import { useHeatmap, computeMuscleData, heatColor, heatStatus, timeAgo } from '../../store/useHeatmap'
import BodyMap, { DEEP_MUSCLES } from './BodyMap'
import { PersonStanding, RotateCcw, Activity, HeartPulse, X } from 'lucide-react'

const MUSCLE_LABELS = {
  cuadriceps: 'Cuádriceps', isquiotibiales: 'Isquiotibiales', gluteos: 'Glúteos',
  aductores: 'Aductores', abductores: 'Abductores', gemelos: 'Gemelos', soleo: 'Sóleo',
  core: 'Core', oblicuos: 'Oblicuos', transverso: 'Transverso', lumbar: 'Lumbar',
  dorsales: 'Dorsales', trapecio: 'Trapecio', romboides: 'Romboides',
  pectoral: 'Pectoral', deltoides: 'Deltoides', biceps: 'Bíceps', triceps: 'Tríceps',
  antebrazos: 'Antebrazos', psoas: 'Psoas', cardio: 'Motor Cardíaco',
}

function MuscleDetail({ muscle, data, onClose }) {
  const status = heatStatus(data)
  return (
    <div className="bg-panel-card rounded-2xl border border-panel-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-panel-border" style={{ background: heatColor(data?.heat ?? 0) }} />
          <span className="text-sm font-bold text-slate-200">{MUSCLE_LABELS[muscle] || muscle}</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-600 hover:text-slate-300">
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-panel-bg rounded-xl p-2.5 text-center border border-panel-border">
          <div className="text-sm font-bold font-mono" style={{ color: status.color }}>{status.label}</div>
          <div className="text-[9px] text-slate-600 tracking-widest mt-0.5">ESTADO</div>
        </div>
        <div className="bg-panel-bg rounded-xl p-2.5 text-center border border-panel-border">
          <div className="text-sm font-bold font-mono text-slate-200">{data?.sets ?? 0}</div>
          <div className="text-[9px] text-slate-600 tracking-widest mt-0.5">SERIES 7D</div>
        </div>
        <div className="bg-panel-bg rounded-xl p-2.5 text-center border border-panel-border">
          <div className="text-sm font-bold font-mono text-slate-200">{timeAgo(data?.lastAt) ?? '—'}</div>
          <div className="text-[9px] text-slate-600 tracking-widest mt-0.5">ÚLTIMO</div>
        </div>
      </div>

      {data?.exercises?.size > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[...data.exercises].map((name) => (
            <span key={name} className="text-[10px] px-2 py-1 rounded-full bg-panel-bg border border-panel-border text-slate-400">
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ScannerScreen() {
  const { exercises } = useCatalog()
  const { sets, loading, load } = useHeatmap()
  const [view, setView] = useState('front')
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [])

  const muscleData = useMemo(() => computeMuscleData(sets, exercises), [sets, exercises])

  const totalSets = sets.length
  const cardioData = muscleData.cardio
  const trainedMuscles = Object.keys(muscleData).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-panel-card rounded-2xl border border-panel-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PersonStanding size={16} className="text-neon-blue" />
            <span className="text-xs text-slate-500 tracking-widest font-mono">BODY SCANNER — 7 DÍAS</span>
          </div>
          <button onClick={load} className="p-1.5 text-slate-600 hover:text-neon-blue transition-panel">
            <RotateCcw size={13} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'SERIES', value: totalSets, icon: Activity },
            { label: 'MÚSCULOS', value: trainedMuscles, icon: PersonStanding },
            { label: 'CARDIO', value: cardioData ? `${cardioData.sets}` : '0', icon: HeartPulse },
          ].map(({ label, value }) => (
            <div key={label} className="bg-panel-bg rounded-xl p-2.5 text-center border border-panel-border">
              <div className="text-lg font-bold font-mono text-neon-blue">{value}</div>
              <div className="text-[9px] text-slate-600 tracking-widest mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle frente/espalda */}
      <div className="grid grid-cols-2 gap-2">
        {[['front', 'FRENTE'], ['back', 'ESPALDA']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setView(id); setSelected(null) }}
            className={`py-2.5 rounded-xl border text-xs font-bold tracking-widest transition-panel ${
              view === id
                ? 'bg-neon-blue/10 border-neon-blue/40 text-neon-blue'
                : 'bg-panel-card border-panel-border text-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mapa */}
      <div className="bg-panel-card rounded-2xl border border-panel-border p-4 relative">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-600 font-mono animate-pulse">ESCANEANDO...</div>
        ) : (
          <BodyMap view={view} muscleData={muscleData} selected={selected} onSelect={setSelected} />
        )}

        {/* Leyenda */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[9px] text-slate-600 tracking-wider">REPOSO</span>
          <div className="flex-1 h-1.5 rounded-full" style={{
            background: 'linear-gradient(90deg, #182233, #0e5b46, #2ee6a8, #fb923c, #ef4444)'
          }} />
          <span className="text-[9px] text-slate-600 tracking-wider">FATIGA</span>
        </div>
      </div>

      {/* Detalle del músculo seleccionado */}
      {selected && (
        <MuscleDetail muscle={selected} data={muscleData[selected]} onClose={() => setSelected(null)} />
      )}

      {/* Sistemas profundos */}
      <div className="bg-panel-card rounded-2xl border border-panel-border p-4">
        <div className="text-xs text-slate-500 tracking-widest font-mono mb-3">SISTEMAS PROFUNDOS</div>
        <div className="grid grid-cols-3 gap-2">
          {DEEP_MUSCLES.map((m) => {
            const data = muscleData[m]
            const status = heatStatus(data)
            return (
              <button
                key={m}
                onClick={() => setSelected(selected === m ? null : m)}
                className={`p-2.5 rounded-xl border text-center transition-panel ${
                  selected === m ? 'border-neon-blue/40 bg-neon-blue/5' : 'border-panel-border bg-panel-bg'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1.5 border border-panel-border" style={{ background: heatColor(data?.heat ?? 0) }} />
                <div className="text-[10px] font-medium text-slate-300">{MUSCLE_LABELS[m]}</div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: status.color }}>{status.label}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
