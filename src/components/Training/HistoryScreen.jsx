import { useEffect, useMemo, useState } from 'react'
import { useHistory, sessionStats, weeklyVolume, exerciseProgression } from '../../store/useHistory'
import { useCatalog } from '../../store/useCatalog'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, Calendar, Trophy, ChevronDown, ChevronUp } from 'lucide-react'

const PROTOCOL_BADGE = {
  standard: { label: 'STD', cls: 'border-neon-green/30 bg-neon-green/10 text-neon-green' },
  bypass: { label: 'BYP', cls: 'border-neon-orange/30 bg-neon-orange/10 text-neon-orange' },
  neural_priming: { label: 'PRI', cls: 'border-neon-blue/30 bg-neon-blue/10 text-neon-blue' },
}

const tooltipStyle = {
  contentStyle: {
    background: '#111927',
    border: '1px solid #1e2a3d',
    borderRadius: '12px',
    fontSize: '11px',
    fontFamily: 'JetBrains Mono, monospace',
  },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#2ee6a8' },
}

function SessionRow({ session, logs, exercises }) {
  const [open, setOpen] = useState(false)
  const stats = sessionStats(session, logs)
  const badge = PROTOCOL_BADGE[session.protocol_id] || PROTOCOL_BADGE.standard

  const dateLabel = new Date(session.started_at).toLocaleDateString('es-ES', {
    weekday: 'short', day: '2-digit', month: 'short'
  }).toUpperCase()

  // Resumen por ejercicio
  const byExercise = useMemo(() => {
    if (!open) return []
    const ids = [...new Set(stats.logs.map((l) => l.exercise_id))]
    return ids.map((id) => {
      const ex = exercises.find((e) => e.id === id)
      const exLogs = stats.logs.filter((l) => l.exercise_id === id)
      const top = exLogs.reduce((best, l) => (l.weight_kg ?? 0) > (best?.weight_kg ?? 0) ? l : best, null)
      return { name: ex?.name ?? '—', sets: exLogs.length, top }
    })
  }, [open])

  return (
    <div className="bg-panel-card rounded-2xl border border-panel-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3.5 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">{dateLabel}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-wider ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <div className="text-[10px] text-slate-600 font-mono mt-0.5">
            {stats.sets} series{stats.duration ? ` · ${stats.duration}` : ''}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold font-mono text-neon-green">
            {stats.volume > 0 ? `${stats.volume}kg` : '—'}
          </div>
          <div className="text-[9px] text-slate-600 tracking-widest">VOLUMEN</div>
        </div>
        {open ? <ChevronUp size={14} className="text-slate-600 shrink-0" /> : <ChevronDown size={14} className="text-slate-600 shrink-0" />}
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 border-t border-panel-border pt-3 space-y-2">
          {byExercise.map(({ name, sets, top }) => (
            <div key={name} className="flex items-center justify-between text-xs">
              <span className="text-slate-300 truncate flex-1">{name}</span>
              <span className="text-slate-500 font-mono shrink-0 ml-2">
                {sets}×{top?.weight_kg ? ` · top ${top.weight_kg}kg×${top.reps ?? '—'}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HistoryScreen() {
  const { sessions, logs, loading, load } = useHistory()
  const { exercises } = useCatalog()
  const [selectedExercise, setSelectedExercise] = useState('')

  useEffect(() => { load() }, [])

  const weekly = useMemo(() => weeklyVolume(sessions, logs), [sessions, logs])

  // Ejercicios con datos, ordenados por frecuencia
  const trackedExercises = useMemo(() => {
    const counts = {}
    for (const l of logs) counts[l.exercise_id] = (counts[l.exercise_id] || 0) + 1
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => exercises.find((e) => e.id === id))
      .filter(Boolean)
  }, [logs, exercises])

  const activeExerciseId = selectedExercise || trackedExercises[0]?.id
  const progression = useMemo(
    () => activeExerciseId ? exerciseProgression(activeExerciseId, sessions, logs) : { points: [], pr: null },
    [activeExerciseId, sessions, logs]
  )

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-600 font-mono animate-pulse">CARGANDO HISTORIAL...</div>
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-panel-card rounded-2xl border border-panel-border p-8 text-center space-y-2">
        <Calendar size={24} className="text-slate-600 mx-auto" />
        <p className="text-xs text-slate-500">
          Todavía no hay sesiones completadas.
          <br />Terminá tu primer entrenamiento y acá aparece la data.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Volumen semanal */}
      <div className="bg-panel-card rounded-2xl border border-panel-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-neon-green" />
          <span className="text-xs text-slate-500 tracking-widest font-mono">VOLUMEN SEMANAL (KG)</span>
        </div>
        <div className="h-40 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3d" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip {...tooltipStyle} cursor={{ fill: '#182233' }} />
              <Bar dataKey="volume" name="kg" fill="#2ee6a8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progresión por ejercicio */}
      {trackedExercises.length > 0 && (
        <div className="bg-panel-card rounded-2xl border border-panel-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-neon-blue" />
            <span className="text-xs text-slate-500 tracking-widest font-mono">PROGRESIÓN DE CARGA</span>
          </div>

          <select
            value={activeExerciseId ?? ''}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full bg-panel-bg border border-panel-border rounded-xl px-3 py-2.5 text-sm text-slate-200 mb-3 focus:border-neon-blue/50 focus:outline-none"
          >
            {trackedExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>

          {progression.pr?.weight_kg && (
            <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-neon-blue/5 border border-neon-blue/20">
              <Trophy size={12} className="text-neon-blue shrink-0" />
              <span className="text-xs text-neon-blue font-mono font-bold">
                PR: {progression.pr.weight_kg}kg × {progression.pr.reps ?? '—'}
              </span>
            </div>
          )}

          {progression.points.length >= 2 ? (
            <div className="h-36 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progression.points}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3d" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={40} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="max" name="kg máx" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-[10px] text-slate-600 text-center py-4">
              Con 2+ sesiones de este ejercicio se dibuja la curva de progresión
            </p>
          )}
        </div>
      )}

      {/* Lista de sesiones */}
      <div>
        <div className="text-xs text-slate-500 tracking-widest font-mono mb-2 px-1">
          SESIONES ({sessions.length})
        </div>
        <div className="space-y-2">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} logs={logs} exercises={exercises} />
          ))}
        </div>
      </div>
    </div>
  )
}
