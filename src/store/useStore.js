import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import exercisesData from '../data/exercises.json'

const NEXT_MATCH_DATE = new Date('2026-04-12T16:00:00') // Próximo partido

export const useStore = create(
  persist(
    (set, get) => ({
      // --- Sistema Nervioso Central ---
      sncBattery: 78,
      restDays: 1,
      lastTrainingLoad: 'medio', // bajo | medio | alto

      // --- Alertas de Estado ---
      alerts: {
        soleoPain: false,
        matchTomorrow: false,
        dietFail: false,
      },

      // --- Protocolo activo ---
      activeProtocol: 'standard',

      // --- Checklist diaria de nutrición ---
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

      // --- Acciones ---
      toggleAlert: (alertKey) => {
        const { alerts } = get()
        const newValue = !alerts[alertKey]
        const newAlerts = { ...alerts, [alertKey]: newValue }

        let protocol = 'standard'
        if (newAlerts.soleoPain) protocol = 'bypass'
        else if (newAlerts.matchTomorrow) protocol = 'neural_priming'

        const historyEntry = {
          id: Date.now(),
          alert: alertKey,
          value: newValue,
          protocol,
          timestamp: new Date().toISOString(),
        }

        set((state) => ({
          alerts: newAlerts,
          activeProtocol: protocol,
          alertHistory: [historyEntry, ...state.alertHistory.slice(0, 9)],
        }))
      },

      toggleNutrition: (key) => {
        const { nutritionChecklist, alerts } = get()
        const newChecklist = {
          ...nutritionChecklist,
          [key]: !nutritionChecklist[key],
        }

        // Si marca fallo en dieta (desmarca no_sugar), activar alerta
        const dietFail = !newChecklist.no_sugar
        set({
          nutritionChecklist: newChecklist,
          alerts: { ...alerts, dietFail },
        })
      },

      setSNCBattery: (value) => set({ sncBattery: value }),

      updateRestDays: (days) => {
        // SNC recovery: 15% por día de descanso, cap 100
        const base = get().sncBattery
        const recovered = Math.min(100, base + days * 15)
        set({ restDays: days, sncBattery: recovered })
      },

      resetDailyChecklist: () => {
        set({
          nutritionChecklist: {
            water: false,
            protein: false,
            no_sugar: false,
            sleep: false,
            creatine: false,
            omega3: false,
          },
          alerts: { soleoPain: false, matchTomorrow: false, dietFail: false },
          activeProtocol: 'standard',
        })
      },

      getActiveProtocolData: () => {
        const { activeProtocol } = get()
        return exercisesData.protocols[activeProtocol]
      },

      getNutritionScore: () => {
        const { nutritionChecklist } = get()
        const critical = ['water', 'protein', 'no_sugar', 'sleep']
        const scored = critical.filter((k) => nutritionChecklist[k]).length
        return Math.round((scored / critical.length) * 100)
      },
    }),
    {
      name: 'enganche-os-storage',
      partialize: (state) => ({
        sncBattery: state.sncBattery,
        restDays: state.restDays,
        nutritionChecklist: state.nutritionChecklist,
        alertHistory: state.alertHistory,
      }),
    }
  )
)
