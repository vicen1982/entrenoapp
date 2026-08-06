import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAilments = create((set, get) => ({
  ailments: [],
  loaded: false,

  load: async () => {
    const { data } = await supabase
      .from('ailments')
      .select('*')
      .eq('active', true)
      .order('reported_at', { ascending: false })
    set({ ailments: data ?? [], loaded: true })
  },

  add: async (ailment) => {
    const { data, error } = await supabase
      .from('ailments')
      .insert(ailment)
      .select()
      .single()
    if (!error && data) set({ ailments: [data, ...get().ailments] })
    return error
  },

  resolve: async (id) => {
    await supabase
      .from('ailments')
      .update({ active: false, resolved_at: new Date().toISOString() })
      .eq('id', id)
    set({ ailments: get().ailments.filter((a) => a.id !== id) })
  },
}))

// Todos los exercise_id excluidos por dolencias activas, sin duplicados
export function excludedByAilments(ailments) {
  const ids = new Set()
  for (const a of ailments) {
    for (const id of a.excluded_exercise_ids || []) ids.add(id)
  }
  return ids
}
