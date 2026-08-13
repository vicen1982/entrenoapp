import { create } from 'zustand'
import { useCatalog } from './useCatalog'
import { useAilments } from './useAilments'
import { useSession } from './useSession'
import { useRoutinePlan, todayKey } from './useRoutinePlan'

export const useCoach = create((set) => ({
  loading: false,
  result: null,
  error: null,
  lastText: '',

  ask: async (text) => {
    set({ loading: true, error: null, result: null, lastText: text })
    const { exercises } = useCatalog.getState()

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, catalog: exercises }),
      })
      const data = await res.json()
      if (!res.ok) {
        set({ loading: false, error: data.error || 'error_desconocido' })
        return
      }
      set({ loading: false, result: data })
    } catch (err) {
      set({ loading: false, error: 'network_error' })
    }
  },

  clear: () => set({ result: null, error: null }),

  // Resuelve exercise_id (existente o recién creado) para un ítem del resultado de la IA
  _resolveExercise: async (item) => {
    const { addExercise } = useCatalog.getState()
    if (item.exercise_id) return item.exercise_id
    if (!item.new_exercise) return null

    const before = useCatalog.getState().exercises.map((e) => e.id)
    const err = await addExercise({
      name: item.new_exercise.name,
      module: 'piernas',
      muscles: item.new_exercise.muscles || [],
      default_sets: item.new_exercise.default_sets || item.sets || 3,
      default_reps: item.new_exercise.default_reps || item.reps || '10',
    })
    if (err) return null
    const after = useCatalog.getState().exercises
    const created = after.find((e) => !before.includes(e.id) && e.name === item.new_exercise.name)
    return created?.id ?? null
  },

  // Guarda el plan semanal completo (crea ejercicios nuevos que falten) sin iniciar sesión
  saveRoutine: async (result) => {
    const { _resolveExercise } = useCoach.getState()
    const days = []
    for (const dayBlock of result.dias || []) {
      const exercises = []
      for (const item of dayBlock.ejercicios || []) {
        const id = await _resolveExercise(item)
        if (id) exercises.push({ exercise_id: id, sets: item.sets, reps: item.reps })
      }
      days.push({ day: dayBlock.day, objetivo: dayBlock.objetivo, exercises })
    }
    const { save } = useRoutinePlan.getState()
    const { lastText } = useCoach.getState()
    await save(lastText, result.explicacion, days)
    return days
  },

  // Guarda el plan y además arranca ya la sesión con el día que corresponde a hoy (si existe)
  saveAndStartToday: async (result) => {
    const { saveRoutine } = useCoach.getState()
    const days = await saveRoutine(result)
    const today = todayKey()
    const todayBlock = days.find((d) => d.day === today) || days.find((d) => d.day === null)
    if (!todayBlock || todayBlock.exercises.length === 0) return false

    const { start, addExercise: addToSession } = useSession.getState()
    const catalogNow = useCatalog.getState().exercises
    await start('standard')
    for (const { exercise_id } of todayBlock.exercises) {
      const ex = catalogNow.find((e) => e.id === exercise_id)
      if (ex) await addToSession(ex)
    }
    return true
  },

  applyAilment: async (result) => {
    const { add } = useAilments.getState()
    const d = result.dolencia
    if (!d) return
    await add({
      description: d.descripcion,
      muscles_affected: d.muscles_affected || [],
      excluded_exercise_ids: (d.exclusions || []).map((e) => e.exercise_id).filter(Boolean),
      alternatives: d.alternativas || [],
    })
  },
}))
