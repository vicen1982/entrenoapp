import { Home, Dumbbell, PersonStanding, Flame, Settings } from 'lucide-react'

const TABS = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'entrenar', label: 'Entrenar', icon: Dumbbell },
  { id: 'escaner', label: 'Escáner', icon: PersonStanding },
  { id: 'combustible', label: 'Combustible', icon: Flame },
  { id: 'sistema', label: 'Sistema', icon: Settings },
]

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-panel-bg/95 backdrop-blur-md border-t border-panel-border pb-safe">
      <div className="max-w-lg mx-auto flex">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-panel"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? 'text-neon-green' : 'text-slate-600'}
              />
              <span className={`text-[10px] font-medium tracking-wide ${active ? 'text-neon-green' : 'text-slate-600'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
