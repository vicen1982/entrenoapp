import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Series completadas de los últimos 7 días (solo sesiones cerradas)
export const useHeatmap = create((set) => ({
  sets: [],
  loading: true,

  load: async () => {
    const since = new Date(Date.now() - 7 * 86400000).toISOString()
    const { data } = await supabase
      .from('set_logs')
      .select('exercise_id, completed_at, weight_kg, reps, seconds, workout_sessions!inner(status)')
      .eq('completed', true)
      .eq('workout_sessions.status', 'completed')
      .gte('completed_at', since)
    set({ sets: data ?? [], loading: false })
  },
}))

// Decaimiento por recuperación: una serie de hace 3 días pesa menos que una de hoy
function decayFactor(completedAt) {
  const hours = (Date.now() - new Date(completedAt)) / 3600000
  if (hours < 24) return 1
  if (hours < 48) return 0.7
  if (hours < 72) return 0.45
  if (hours < 120) return 0.25
  return 0.1
}

// score ~6 series recientes efectivas => heat 1.0 (fatiga máxima)
export function computeMuscleData(sets, exercises) {
  const byId = Object.fromEntries(exercises.map((e) => [e.id, e]))
  const muscles = {}

  for (const log of sets) {
    const ex = byId[log.exercise_id]
    if (!ex?.muscles) continue
    const factor = decayFactor(log.completed_at)
    for (const m of ex.muscles) {
      if (!muscles[m]) muscles[m] = { score: 0, sets: 0, lastAt: null, exercises: new Set() }
      muscles[m].score += factor
      muscles[m].sets += 1
      muscles[m].exercises.add(ex.name)
      if (!muscles[m].lastAt || log.completed_at > muscles[m].lastAt) {
        muscles[m].lastAt = log.completed_at
      }
    }
  }

  for (const m of Object.values(muscles)) {
    m.heat = Math.min(1, m.score / 6)
  }
  return muscles
}

// Gradiente: sin estímulo → recuperado (verde) → cargado (naranja) → fatigado (rojo)
const STOPS = [
  [0.0, [24, 34, 51]],     // #182233 panel-surface
  [0.35, [14, 91, 70]],    // verde oscuro
  [0.6, [46, 230, 168]],   // #2ee6a8 neon-green
  [0.8, [251, 146, 60]],   // #fb923c neon-orange
  [1.0, [239, 68, 68]],    // #ef4444 rojo
]

export function heatColor(heat) {
  if (!heat || heat <= 0) return `rgb(${STOPS[0][1].join(',')})`
  for (let i = 1; i < STOPS.length; i++) {
    if (heat <= STOPS[i][0]) {
      const [t0, c0] = STOPS[i - 1]
      const [t1, c1] = STOPS[i]
      const t = (heat - t0) / (t1 - t0)
      const rgb = c0.map((c, j) => Math.round(c + (c1[j] - c) * t))
      return `rgb(${rgb.join(',')})`
    }
  }
  return `rgb(${STOPS[STOPS.length - 1][1].join(',')})`
}

export function heatStatus(data) {
  if (!data || data.score === 0) return { label: 'SIN ESTÍMULO', color: '#475569' }
  if (data.heat < 0.35) return { label: 'RECUPERADO', color: '#2ee6a8' }
  if (data.heat < 0.7) return { label: 'CARGADO', color: '#facc15' }
  if (data.heat < 0.85) return { label: 'ALTO', color: '#fb923c' }
  return { label: 'FATIGADO', color: '#ef4444' }
}

export function timeAgo(iso) {
  if (!iso) return null
  const hours = Math.floor((Date.now() - new Date(iso)) / 3600000)
  if (hours < 1) return 'hace <1h'
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}
