import { MUSCLE_VIEWS, SILHOUETTE, DEEP_MUSCLES } from '../Scanner/BodyMap'
import { Dumbbell } from 'lucide-react'

/*
 * Mini-ícono no interactivo del mapa muscular: resalta en verde neón los
 * músculos que trabaja un ejercicio puntual. Elige automáticamente la vista
 * (frente/espalda) que más músculos del ejercicio contiene.
 */

function renderShape(shape, key, active) {
  const fill = active ? '#2ee6a8' : '#1a2438'
  const stroke = active ? '#2ee6a8' : '#223047'
  const common = { fill, stroke, strokeWidth: 1 }
  if (shape.el === 'ellipse') {
    return <ellipse key={key} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...common} />
  }
  if (shape.el === 'poly') {
    return <polygon key={key} points={shape.points} strokeLinejoin="round" {...common} />
  }
  return <rect key={key} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...common} />
}

export default function MuscleThumb({ muscles = [], size = 40 }) {
  const set = new Set(muscles)
  const isDeepOnly = muscles.length > 0 && muscles.every((m) => DEEP_MUSCLES.includes(m))

  if (muscles.length === 0 || isDeepOnly) {
    return (
      <div
        className="shrink-0 rounded-lg bg-panel-bg border border-panel-border flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Dumbbell size={size * 0.45} className="text-neon-green/70" />
      </div>
    )
  }

  const frontCount = MUSCLE_VIEWS.front.filter((s) => set.has(s.muscle)).length
  const backCount = MUSCLE_VIEWS.back.filter((s) => set.has(s.muscle)).length
  const view = backCount > frontCount ? 'back' : 'front'
  const shapes = MUSCLE_VIEWS[view]

  return (
    <div
      className="shrink-0 rounded-lg bg-panel-bg border border-panel-border overflow-hidden"
      style={{ width: size, height: size }}
    >
      <svg viewBox="30 20 140 340" className="w-full h-full">
        <path d={SILHOUETTE} fill="#0e141f" stroke="#223047" strokeWidth="1.5" />
        {shapes.map((s, i) => {
          const active = set.has(s.muscle)
          return (
            <g key={`${s.muscle}-${i}`}>
              {renderShape(s, `a-${i}`, active)}
              {s.mirror && (
                <g transform="translate(200,0) scale(-1,1)">
                  {renderShape(s, `b-${i}`, active)}
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
