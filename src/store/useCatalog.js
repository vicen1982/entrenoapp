import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useCatalog = create((set, get) => ({
  modules: [],
  exercises: [],
  loaded: false,
  error: null,

  load: async () => {
    const [mods, exs] = await Promise.all([
      supabase.from('modules').select('*').order('sort_order'),
      supabase.from('exercises').select('*').order('name'),
    ])

    if (mods.error || exs.error) {
      set({ loaded: true, error: 'catalog_missing' })
      return
    }

    set({
      modules: mods.data ?? [],
      exercises: exs.data ?? [],
      loaded: true,
      error: null,
    })
  },

  addExercise: async (exercise) => {
    const { error } = await supabase.from('exercises').insert({
      ...exercise,
      is_custom: true,
    })
    if (!error) await get().load()
    return error
  },

  deleteExercise: async (id) => {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)
      .eq('is_custom', true)
    if (!error) await get().load()
    return error
  },
}))

// Filtra el catálogo según el protocolo activo
export function filterByProtocol(exercises, protocol) {
  if (protocol === 'bypass') return exercises.filter((e) => !e.soleo_load)
  if (protocol === 'neural_priming') return exercises.filter((e) => e.priming_ok)
  return exercises
}
