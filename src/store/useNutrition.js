import { create } from 'zustand'
import { supabase } from '../lib/supabase'

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const useNutrition = create((set, get) => ({
  meals: [],
  loading: true,

  load: async () => {
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('date', todayISO())
      .order('logged_at')
    set({ meals: data ?? [], loading: false })
  },

  addMeal: async (meal) => {
    const { data, error } = await supabase
      .from('meals')
      .insert({ ...meal, date: todayISO() })
      .select()
      .single()
    if (!error && data) set({ meals: [...get().meals, data] })
    return error
  },

  deleteMeal: async (id) => {
    await supabase.from('meals').delete().eq('id', id)
    set({ meals: get().meals.filter((m) => m.id !== id) })
  },
}))

export function dailyTotals(meals) {
  return meals.reduce(
    (acc, m) => ({
      protein: acc.protein + Number(m.protein_g || 0),
      carbs: acc.carbs + Number(m.carbs_g || 0),
      fat: acc.fat + Number(m.fat_g || 0),
      calories: acc.calories + Number(m.calories || 0),
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  )
}
