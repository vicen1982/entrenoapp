import { create } from 'zustand'
import { supabase, STATE_ID } from '../lib/supabase'
import exercisesData from '../data/exercises.json'

const NEXT_MATCH_DATE = new Date('2026-04-12T16:00:00')

async function syncToSupabase(partial) {
  await supabase
    .from('daily_state')
    .update({ ...partial, updated_at: new Date().toISOString() })
    .eq('id', STATE_ID)
}

export const useStore = create((set, get) => ({
  // --- Estado de carga ---
  loaded: false,

  // --- Sistema Nervioso Central ---
  sncBattery: 78,
  restDays: 1,
  lastTrainingLoad: 'medio',

  // --- Alertas ---
  alerts: {
    soleoPain: false,
    matchTomorrow: false,
    dietFail: false,
  },

  // --- Protocolo activo ---
  activeProtocol: 'standard',

  // --- Checklist de nutrición ---
  nutritionChecklist: {
    water: false,
    protein: false,
    no_sugar: false,
    sleep: false,
    creatine: false,
    omega3: false,
  },

  // --- Historial de alertas ---
  alertHistory: [],

  // --- Próximo partido ---
  nextMatch: NEXT_MATCH_DATE,

  // --- Cargar estado desde Supabase ---
  loadFromSupabase: async () => {
    const { data, error } = await supabase
      .from('daily_state')
      .select('*')
      .eq('id', STATE_ID)
      .single()

    if (data && !error) {
      set({
        sncBattery: data.snc_battery,
        restDays: data.rest_days,
        lastTrainingLoad: data.last_training_load,
        activeProtocol: data.active_protocol,
        nutritionChecklist: data.nutrition_checklist,
        alerts: data.alerts,
        loaded: true,
      })
    } else {
      set({ loaded: true })
    }

    // Cargar historial de alertas
    const { data: history } = await supabase
      .from('alert_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)

    if (history) {
      set({ alertHistory: history })
    }
  },

  // --- Acciones ---
  toggleAlert: async (alertKey) => {
    const { alerts } = get()
    const newValue = !alerts[alertKey]
    const newAlerts = { ...alerts, [alertKey]: newValue }

    let protocol = 'standard'
    if (newAlerts.soleoPain) protocol = 'bypass'
    else if (newAlerts.matchTomorrow) protocol = 'neural_priming'

    set((state) => ({
      alerts: newAlerts,
      activeProtocol: protocol,
    }))

    await syncToSupabase({ alerts: newAlerts, active_protocol: protocol })

    await supabase.from('alert_history').insert({
      alert: alertKey,
      value: newValue,
      protocol,
      timestamp: new Date().toISOString(),
    })

    const { data: history } = await supabase
      .from('alert_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)

    if (history) set({ alertHistory: history })
  },

  toggleNutrition: async (key) => {
    const { nutritionChecklist, alerts } = get()
    const newChecklist = { ...nutritionChecklist, [key]: !nutritionChecklist[key] }
    const dietFail = !newChecklist.no_sugar
    const newAlerts = { ...alerts, dietFail }

    set({ nutritionChecklist: newChecklist, alerts: newAlerts })
    await syncToSupabase({ nutrition_checklist: newChecklist, alerts: newAlerts })
  },

  setSNCBattery: async (value) => {
    set({ sncBattery: value })
    await syncToSupabase({ snc_battery: value })
  },

  updateRestDays: async (days) => {
    const base = get().sncBattery
    const recovered = Math.min(100, base + days * 15)
    set({ restDays: days, sncBattery: recovered })
    await syncToSupabase({ rest_days: days, snc_battery: recovered })
  },

  resetDailyChecklist: async () => {
    const fresh = {
      nutritionChecklist: {
        water: false, protein: false, no_sugar: false,
        sleep: false, creatine: false, omega3: false,
      },
      alerts: { soleoPain: false, matchTomorrow: false, dietFail: false },
      activeProtocol: 'standard',
    }
    set(fresh)
    await syncToSupabase({
      nutrition_checklist: fresh.nutritionChecklist,
      alerts: fresh.alerts,
      active_protocol: 'standard',
    })
  },

  getActiveProtocolData: () => {
    return exercisesData.protocols[get().activeProtocol]
  },

  getNutritionScore: () => {
    const { nutritionChecklist } = get()
    const critical = ['water', 'protein', 'no_sugar', 'sleep']
    return Math.round((critical.filter((k) => nutritionChecklist[k]).length / critical.length) * 100)
  },
}))
