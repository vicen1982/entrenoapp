import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useHistory = create((set) => ({
  sessions: [],
  logs: [],
  loading: true,

  load: async () => {
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(60)

    let logs = []
    if (sessions?.length) {
      const ids = sessions.map((s) => s.id)
      const res = await supabase
        .from('set_logs')
        .select('*')
        .in('session_id', ids)
        .eq('completed', true)
      logs = res.data ?? []
    }
    set({ sessions: sessions ?? [], logs, loading: false })
  },
}))

export function sessionStats(session, logs) {
  const sLogs = logs.filter((l) => l.session_id === session.id)
  const volume = sLogs.reduce((sum, l) => sum + (l.weight_kg && l.reps ? l.weight_kg * l.reps : 0), 0)
  let duration = null
  if (session.finished_at) {
    const mins = Math.round((new Date(session.finished_at) - new Date(session.started_at)) / 60000)
    duration = mins >= 60 ? `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}` : `${mins}m`
  }
  return { sets: sLogs.length, volume: Math.round(volume), duration, logs: sLogs }
}

// Lunes de la semana de una fecha
function weekStart(date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export function weeklyVolume(sessions, logs, weeks = 8) {
  const byId = Object.fromEntries(sessions.map((s) => [s.id, s]))
  const buckets = {}

  // Inicializar las últimas N semanas (aunque estén vacías)
  const now = weekStart(new Date())
  for (let i = weeks - 1; i >= 0; i--) {
    const w = new Date(now)
    w.setDate(w.getDate() - i * 7)
    const key = w.toISOString().slice(0, 10)
    buckets[key] = { week: key, label: w.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }), volume: 0, sets: 0 }
  }

  for (const log of logs) {
    const session = byId[log.session_id]
    if (!session) continue
    const key = weekStart(session.started_at).toISOString().slice(0, 10)
    if (!buckets[key]) continue
    buckets[key].sets += 1
    if (log.weight_kg && log.reps) buckets[key].volume += log.weight_kg * log.reps
  }

  return Object.values(buckets).map((b) => ({ ...b, volume: Math.round(b.volume) }))
}

export function exerciseProgression(exerciseId, sessions, logs) {
  const byId = Object.fromEntries(sessions.map((s) => [s.id, s]))
  const bySession = {}

  for (const log of logs) {
    if (log.exercise_id !== exerciseId) continue
    const session = byId[log.session_id]
    if (!session) continue
    if (!bySession[session.id]) {
      bySession[session.id] = { date: session.started_at, max: 0, volume: 0, bestSet: null }
    }
    const b = bySession[session.id]
    if (log.weight_kg && log.weight_kg > b.max) {
      b.max = log.weight_kg
      b.bestSet = log
    }
    if (log.weight_kg && log.reps) b.volume += log.weight_kg * log.reps
  }

  const points = Object.values(bySession)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((p) => ({
      label: new Date(p.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      max: p.max,
      volume: Math.round(p.volume),
    }))

  let pr = null
  for (const log of logs) {
    if (log.exercise_id !== exerciseId || !log.weight_kg) continue
    if (!pr || log.weight_kg > pr.weight_kg || (log.weight_kg === pr.weight_kg && (log.reps ?? 0) > (pr.reps ?? 0))) {
      pr = log
    }
  }

  return { points, pr }
}
