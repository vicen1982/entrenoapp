import { MUSCLE_VIEWS, SILHOUETTE, DEEP_MUSCLES } from '../Scanner/BodyMap'
import { Dumbbell } from 'lucide-react'

/*
 * Mini-ícono no interactivo del mapa muscular: hace zoom sobre la zona que
 * trabaja un ejercicio puntual y la resalta con un glow rojo-naranja, imitando
 * una vista anatómica. Elige automáticamente la vista (frente/espalda) que más
 * músculos del ejercicio contiene, y recorta el viewBox a esa zona.
 */

let uid = 0

function shapeBBox(shape) {
  if (shape.el === 'ellipse') {
    return { x1: shape.cx - shape.rx, y1: shape.cy - shape.ry, x2: shape.cx + shape.rx, y2: shape.cy + shape.ry }
  }
  if (shape.el === 'poly') {
    const pts = shape.points.split(' ').map((p) => p.split(',').map(Number))
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) }
  }
  return { x1: shape.x, y1: shape.y, x2: shape.x + shape.w, y2: shape.y + shape.h }
}

function mirrorBBox(b) {
  return { x1: 200 - b.x2, y1: b.y1, x2: 200 - b.x1, y2: b.y2 }
}

function renderShape(shape, key, active, glowId) {
  if (!active) {
    return (() => {
      if (shape.el === 'ellipse') return <ellipse key={key} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} fill="#1c2740" stroke="#26324a" strokeWidth="1" />
      if (shape.el === 'poly') return <polygon key={key} points={shape.points} fill="#1c2740" stroke="#26324a" strokeWidth="1" strokeLinejoin="round" />
      return <rect key={key} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} fill="#1c2740" stroke="#26324a" strokeWidth="1" />
    })()
  }
  const common = { fill: `url(#${glowId})`, stroke: '#ff8a4c', strokeWidth: 1.2, filter: `url(#${glowId}-blur)` }
  if (shape.el === 'ellipse') return <ellipse key={key} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...common} />
  if (shape.el === 'poly') return <polygon key={key} points={shape.points} strokeLinejoin="round" {...common} />
  return <rect key={key} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...common} />
}

export default function MuscleThumb({ muscles = [], size = 52, zoom = true, view: forcedView, className = '' }) {
  const set = new Set(muscles)
  const isDeepOnly = muscles.length > 0 && muscles.every((m) => DEEP_MUSCLES.includes(m))

  if ((muscles.length === 0 || isDeepOnly) && zoom) {
    return (
      <div
        className="shrink-0 rounded-xl bg-panel-bg border border-panel-border flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Dumbbell size={size * 0.4} className="text-neon-orange/80" />
      </div>
    )
  }

  const frontCount = MUSCLE_VIEWS.front.filter((s) => set.has(s.muscle)).length
  const backCount = MUSCLE_VIEWS.back.filter((s) => set.has(s.muscle)).length
  const view = forcedView ?? (backCount > frontCount ? 'back' : 'front')
  const shapes = MUSCLE_VIEWS[view]

  // Bounding box de los músculos activos (+ su mitad espejada) para hacer zoom
  const boxes = []
  for (const s of shapes) {
    if (!set.has(s.muscle)) continue
    const b = shapeBBox(s)
    boxes.push(b)
    if (s.mirror) boxes.push(mirrorBBox(b))
  }

  const PAD = 26
  const MIN_SPAN = 70
  let vb
  if (!zoom || boxes.length === 0) {
    vb = { x: 30, y: 20, w: 140, h: 340 } // fallback: cuerpo entero
  } else {
    let x1 = Math.min(...boxes.map((b) => b.x1)) - PAD
    let y1 = Math.min(...boxes.map((b) => b.y1)) - PAD
    let x2 = Math.max(...boxes.map((b) => b.x2)) + PAD
    let y2 = Math.max(...boxes.map((b) => b.y2)) + PAD
    if (x2 - x1 < MIN_SPAN) { const c = (x1 + x2) / 2; x1 = c - MIN_SPAN / 2; x2 = c + MIN_SPAN / 2 }
    if (y2 - y1 < MIN_SPAN) { const c = (y1 + y2) / 2; y1 = c - MIN_SPAN / 2; y2 = c + MIN_SPAN / 2 }
    x1 = Math.max(x1, 10); x2 = Math.min(x2, 190)
    y1 = Math.max(y1, 15); y2 = Math.min(y2, 350)
    vb = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
  }

  const glowId = 'mt-glow-' + (uid++)

  return (
    <div
      className={`shrink-0 rounded-xl border border-neon-orange/25 overflow-hidden relative ${className}`}
      style={{
        width: size,
        height: zoom ? size : size * 1.9,
        background: 'radial-gradient(circle at 50% 40%, #1a1420 0%, #0b0f17 75%)',
      }}
    >
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="w-full h-full">
        <defs>
          <radialGradient id={glowId} cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffb46b" />
            <stop offset="55%" stopColor="#ff6b3b" />
            <stop offset="100%" stopColor="#e63946" />
          </radialGradient>
          <filter id={`${glowId}-blur`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={SILHOUETTE} fill="#141c2c" stroke="#26324a" strokeWidth="1.5" />
        {shapes.map((s, i) => {
          const active = set.has(s.muscle)
          return (
            <g key={`${s.muscle}-${i}`}>
              {renderShape(s, `a-${i}`, active, glowId)}
              {s.mirror && (
                <g transform="translate(200,0) scale(-1,1)">
                  {renderShape(s, `b-${i}`, active, glowId)}
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
