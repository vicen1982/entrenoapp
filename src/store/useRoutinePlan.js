import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const DAY_KEY_ES = {
  'lunes': 'lunes', 'martes': 'martes', 'miércoles': 'miercoles', 'miercoles': 'miercoles',
  'jueves': 'jueves', 'viernes': 'viernes', 'sábado': 'sabado', 'sabado': 'sabado', 'domingo': 'domingo',
}

export function todayKey() {
  const raw = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
  return DAY_KEY_ES[raw] || raw
}

export const DAY_LABELS = {
  lunes: 'LUNES', martes: 'MARTES', miercoles: 'MIÉRCOLES', jueves: 'JUEVES',
  viernes: 'VIERNES', sabado: 'SÁBADO', domingo: 'DOMINGO',
}
export const DAY_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

export const useRoutinePlan = create((set, get) => ({
  plan: null,
  loaded: false,

  load: async () => {
    const { data } = await supabase
      .from('routine_plans')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
    set({ plan: data?.[0] ?? null, loaded: true })
  },

  // Guarda un plan nuevo y desactiva el anterior
  save: async (sourceText, explicacion, days) => {
    await supabase.from('routine_plans').update({ active: false }).eq('active', true)
    const { data, error } = await supabase
      .from('routine_plans')
      .insert({ source_text: sourceText, explicacion, days, active: true })
      .select()
      .single()
    if (!error && data) set({ plan: data })
    return error
  },

  clear: async () => {
    const { plan } = get()
    if (plan) await supabase.from('routine_plans').update({ active: false }).eq('id', plan.id)
    set({ plan: null })
  },
}))

// Día del plan que corresponde a hoy; si el plan es de un solo día genérico (day: null), lo devuelve siempre
export function dayForToday(plan) {
  if (!plan) return null
  const today = todayKey()
  const exact = plan.days.find((d) => d.day === today)
  if (exact) return exact
  const generic = plan.days.find((d) => d.day === null)
  return generic ?? null
}
