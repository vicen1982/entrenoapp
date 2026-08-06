import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useSession = create((set, get) => ({
  session: null,
  logs: [],
  checking: true,

  // Retomar sesión activa si existe (ej: cerraste la app a mitad de entreno)
  checkActive: async () => {
    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)

    const session = data?.[0] ?? null
    let logs = []
    if (session) {
      const res = await supabase
        .from('set_logs')
        .select('*')
        .eq('session_id', session.id)
        .order('id')
      logs = res.data ?? []
    }
    set({ session, logs, checking: false })
  },

  start: async (protocolId) => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({ protocol_id: protocolId })
      .select()
      .single()
    if (!error) set({ session: data, logs: [] })
    return error
  },

  addExercise: async (exercise) => {
    const { session, logs } = get()
    if (!session) return

    // Prefill con el último peso registrado para este ejercicio
    let lastWeight = null
    const prev = await supabase
      .from('set_logs')
      .select('weight_kg')
      .eq('exercise_id', exercise.id)
      .not('weight_kg', 'is', null)
      .order('id', { ascending: false })
      .limit(1)
    if (prev.data?.[0]) lastWeight = prev.data[0].weight_kg

    const rows = Array.from({ length: exercise.default_sets || 3 }, (_, i) => ({
      session_id: session.id,
      exercise_id: exercise.id,
      set_number: i + 1,
      weight_kg: lastWeight,
    }))
    const { data } = await supabase.from('set_logs').insert(rows).select()
    if (data) set({ logs: [...logs, ...data] })
  },

  addSet: async (exerciseId) => {
    const { session, logs } = get()
    const exLogs = logs.filter((l) => l.exercise_id === exerciseId)
    const last = exLogs[exLogs.length - 1]
    const { data } = await supabase
      .from('set_logs')
      .insert({
        session_id: session.id,
        exercise_id: exerciseId,
        set_number: exLogs.length + 1,
        weight_kg: last?.weight_kg ?? null,
      })
      .select()
    if (data) set({ logs: [...logs, ...data] })
  },

  updateSet: async (logId, patch) => {
    set((s) => ({ logs: s.logs.map((l) => (l.id === logId ? { ...l, ...patch } : l)) }))
    await supabase.from('set_logs').update(patch).eq('id', logId)
  },

  completeSet: async (logId, values = {}) => {
    const patch = { ...values, completed: true, completed_at: new Date().toISOString() }
    set((s) => ({ logs: s.logs.map((l) => (l.id === logId ? { ...l, ...patch } : l)) }))
    await supabase.from('set_logs').update(patch).eq('id', logId)
  },

  uncompleteSet: async (logId) => {
    const patch = { completed: false, completed_at: null }
    set((s) => ({ logs: s.logs.map((l) => (l.id === logId ? { ...l, ...patch } : l)) }))
    await supabase.from('set_logs').update(patch).eq('id', logId)
  },

  removeExercise: async (exerciseId) => {
    const { session, logs } = get()
    await supabase
      .from('set_logs')
      .delete()
      .eq('session_id', session.id)
      .eq('exercise_id', exerciseId)
    set({ logs: logs.filter((l) => l.exercise_id !== exerciseId) })
  },

  finish: async () => {
    const { session } = get()
    if (!session) return
    await supabase
      .from('workout_sessions')
      .update({ status: 'completed', finished_at: new Date().toISOString() })
      .eq('id', session.id)
    set({ session: null, logs: [] })
  },

  abandon: async () => {
    const { session } = get()
    if (!session) return
    // Sin series completadas => borrar la sesión en vez de guardarla vacía
    const { logs } = get()
    const hasWork = logs.some((l) => l.completed)
    if (hasWork) {
      await supabase
        .from('workout_sessions')
        .update({ status: 'abandoned', finished_at: new Date().toISOString() })
        .eq('id', session.id)
    } else {
      await supabase.from('workout_sessions').delete().eq('id', session.id)
    }
    set({ session: null, logs: [] })
  },
}))
