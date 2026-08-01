import { useStore } from '../../store/useStore'
import { AlertTriangle, Zap, Coffee, Shield, CheckCircle } from 'lucide-react'

const ALERT_CONFIG = {
  soleoPain: {
    key: 'soleoPain',
    label: 'ALERTA GEMELO/SÓLEO',
    sublabel: 'Activa Protocolo Bypass',
    icon: AlertTriangle,
    color: 'neon-orange',
    borderClass: 'panel-border-orange',
    glowClass: 'glow-orange',
    activeClass: 'bg-neon-orange/10 border-neon-orange/50 text-neon-orange',
    inactiveClass: 'bg-panel-bg border-panel-border text-slate-500 hover:border-neon-orange/30 hover:text-neon-orange',
    activeText: 'BYPASS ACTIVADO',
    inactiveText: 'REPORTAR DOLOR SÓLEO',
  },
  matchTomorrow: {
    key: 'matchTomorrow',
    label: 'PARTIDO MAÑANA',
    sublabel: 'Activa Neural Priming',
    icon: Zap,
    color: 'neon-blue',
    borderClass: 'panel-border-blue',
    glowClass: 'glow-blue',
    activeClass: 'bg-neon-blue/10 border-neon-blue/50 text-neon-blue',
    inactiveClass: 'bg-panel-bg border-panel-border text-slate-500 hover:border-neon-blue/30 hover:text-neon-blue',
    activeText: 'NEURAL PRIMING ON',
    inactiveText: 'PARTIDO MAÑANA',
  },
  dietFail: {
    key: 'dietFail',
    label: 'FALLO EN DIETA',
    sublabel: 'Flush Metabólico sugerido',
    icon: Coffee,
    color: 'red-400',
    borderClass: '',
    glowClass: '',
    activeClass: 'bg-red-500/10 border-red-500/50 text-red-400',
    inactiveClass: 'bg-panel-bg border-panel-border text-slate-500 hover:border-red-500/30 hover:text-red-400',
    activeText: 'FLUSH PROGRAMADO',
    inactiveText: 'MARCAR FALLO DIETA',
  },
}

export default function AlertPanel() {
  const alerts = useStore((s) => s.alerts)
  const toggleAlert = useStore((s) => s.toggleAlert)
  const alertHistory = useStore((s) => s.alertHistory)

  const activeCount = Object.values(alerts).filter(Boolean).length

  return (
    <div className="bg-panel-card rounded-lg p-5 panel-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500 tracking-widest">PANEL DE ALERTAS</span>
        </div>
        <div className={`text-xs font-bold tracking-wider px-2 py-0.5 rounded ${
          activeCount > 0 ? 'bg-neon-orange/10 text-neon-orange' : 'bg-neon-green/10 text-neon-green'
        }`}>
          {activeCount > 0 ? `${activeCount} ALERTA${activeCount > 1 ? 'S' : ''}` : 'SISTEMA OK'}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {Object.values(ALERT_CONFIG).map((cfg) => {
          const Icon = cfg.icon
          const isActive = alerts[cfg.key]
          return (
            <button
              key={cfg.key}
              onClick={() => toggleAlert(cfg.key)}
              className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-panel
                ${isActive ? cfg.activeClass : cfg.inactiveClass}`}
            >
              <Icon size={16} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold tracking-wider">
                  {isActive ? cfg.activeText : cfg.inactiveText}
                </div>
                <div className="text-xs opacity-60 mt-0.5">{cfg.sublabel}</div>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'animate-pulse bg-current' : 'bg-panel-border'}`} />
            </button>
          )
        })}
      </div>

      {/* Flush metabólico sugerido */}
      {alerts.dietFail && (
        <div className="bg-red-500/5 border border-red-500/20 rounded p-3 mb-4">
          <div className="text-xs font-bold text-red-400 tracking-wider mb-1">
            ⚡ PROTOCOLO SUGERIDO MAÑANA
          </div>
          <div className="text-xs text-slate-400">
            Flush Metabólico: 15 min bici suave (Z1) + 10 min movilidad. Objetivo: clearance de insulina residual.
          </div>
        </div>
      )}

      {/* Log de eventos */}
      {alertHistory.length > 0 && (
        <div>
          <div className="text-xs text-slate-600 tracking-widest mb-2">LOG RECIENTE</div>
          <div className="space-y-1">
            {alertHistory.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle size={10} className="text-slate-700" />
                <span className="text-slate-700">
                  {new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="truncate">{entry.alert} → {entry.protocol}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
