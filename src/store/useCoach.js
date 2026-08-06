import { create } from 'zustand'
import { useCatalog } from './useCatalog'
import { useAilments } from './useAilments'
import { useSession } from './useSession'

export const useCoach = create((set) => ({
  loading: false,
  result: null,
  error: null,

  ask: async (text) => {
    set({ loading: true, error: null, result: null })
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

  // Crea los ejercicios nuevos propuestos y arma la sesión con todo lo interpretado
  applyRoutine: async (result) => {
    const { addExercise, exercises: currentExercises } = useCatalog.getState()
    const activeProtocol = 'standard' // el usuario elige protocolo en pantalla, no acá

    const resolvedIds = []
    for (const item of result.ejercicios || []) {
      if (item.exercise_id) {
        resolvedIds.push({ id: item.exercise_id, sets: item.sets, reps: item.reps })
      } else if (item.new_exercise) {
        const err = await addExercise({
          name: item.new_exercise.name,
          module: 'piernas', // categoría genérica; el usuario puede reclasificar en Sistema
          muscles: item.new_exercise.muscles || [],
          default_sets: item.new_exercise.default_sets || item.sets || 3,
          default_reps: item.new_exercise.default_reps || item.reps || '10',
        })
        if (!err) {
          const fresh = useCatalog.getState().exercises
          const created = fresh.find((e) => e.name === item.new_exercise.name && !currentExercises.some((c) => c.id === e.id))
          if (created) resolvedIds.push({ id: created.id, sets: item.sets, reps: item.reps })
        }
      }
    }

    const { start, addExercise: addToSession } = useSession.getState()
    await start(activeProtocol)
    const catalogNow = useCatalog.getState().exercises
    for (const { id } of resolvedIds) {
      const ex = catalogNow.find((e) => e.id === id)
      if (ex) await addToSession(ex)
    }
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
