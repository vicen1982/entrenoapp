import { MUSCLE_VIEWS, SILHOUETTE_HALF, DEEP_MUSCLES } from '../Scanner/BodyMap'
import { Dumbbell } from 'lucide-react'

/*
 * Mapa muscular del ejercicio. En modo `zoom` recorta sobre la zona trabajada
 * (para miniaturas chicas); en modo completo muestra la figura entera, como
 * las cartas anatómicas de las apps de entrenamiento.
 */

let uid = 0

export default function MuscleThumb({
  muscles = [],
  size = 52,
  zoom = true,
  view: forcedView,
  className = '',
}) {
  const set = new Set(muscles)
  const isDeepOnly = muscles.length > 0 && muscles.every((m) => DEEP_MUSCLES.includes(m))

  if ((muscles.length === 0 || isDeepOnly) && zoom) {
    return (
      <div
        className={`shrink-0 rounded-xl bg-panel-bg border border-panel-border flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <Dumbbell size={size * 0.4} className="text-neon-orange/80" />
      </div>
    )
  }

  const frontHits = MUSCLE_VIEWS.front.filter((s) => set.has(s.muscle))
  const backHits = MUSCLE_VIEWS.back.filter((s) => set.has(s.muscle))
  const view = forcedView ?? (backHits.length > frontHits.length ? 'back' : 'front')
  const shapes = MUSCLE_VIEWS[view]
  const hits = view === 'back' ? backHits : frontHits

  // Zoom sobre el bounding box de los músculos activos (y su mitad espejada)
  let vb = { x: 20, y: 6, w: 160, h: 388 }
  if (zoom && hits.length > 0) {
    const boxes = []
    for (const s of hits) {
      const [x1, y1, x2, y2] = s.box
      boxes.push([x1, y1, x2, y2])
      if (s.mirror) boxes.push([200 - x2, y1, 200 - x1, y2])
    }
    const PAD = 22
    const MIN = 96
    let x1 = Math.min(...boxes.map((b) => b[0])) - PAD
    let y1 = Math.min(...boxes.map((b) => b[1])) - PAD
    let x2 = Math.max(...boxes.map((b) => b[2])) + PAD
    let y2 = Math.max(...boxes.map((b) => b[3])) + PAD
    if (x2 - x1 < MIN) { const c = (x1 + x2) / 2; x1 = c - MIN / 2; x2 = c + MIN / 2 }
    if (y2 - y1 < MIN) { const c = (y1 + y2) / 2; y1 = c - MIN / 2; y2 = c + MIN / 2 }
    // cuadrar para que no se deforme
    const w = x2 - x1
    const h = y2 - y1
    const side = Math.max(w, h)
    const cx = (x1 + x2) / 2
    const cy = (y1 + y2) / 2
    vb = { x: cx - side / 2, y: cy - side / 2, w: side, h: side }
  }

  const gid = 'mm-' + uid++

  return (
    <div
      className={`shrink-0 rounded-xl border border-neon-orange/25 overflow-hidden ${className}`}
      style={{
        width: size,
        height: zoom ? size : size * 1.85,
        background: 'radial-gradient(circle at 50% 40%, #18202e 0%, #0b0f17 80%)',
      }}
    >
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="w-full h-full">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff9d5c" />
            <stop offset="55%" stopColor="#f4552f" />
            <stop offset="100%" stopColor="#c81e3a" />
          </linearGradient>
          <filter id={`${gid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* silueta */}
        <circle cx="100" cy="27" r="17" fill="#131b29" stroke="#26324a" strokeWidth="1.6" />
        <path d={SILHOUETTE_HALF} fill="#131b29" stroke="#26324a" strokeWidth="1.6" strokeLinejoin="round" />
        <g transform="translate(200,0) scale(-1,1)">
          <path d={SILHOUETTE_HALF} fill="#131b29" stroke="#26324a" strokeWidth="1.6" strokeLinejoin="round" />
        </g>

        {/* músculos */}
        {shapes.map((s, i) => {
          const active = set.has(s.muscle)
          const props = {
            d: s.d,
            fill: active ? `url(#${gid})` : '#1d2739',
            stroke: active ? '#ffb184' : '#2b3852',
            strokeWidth: active ? 1.2 : 0.8,
            strokeLinejoin: 'round',
            filter: active ? `url(#${gid}-glow)` : undefined,
          }
          return (
            <g key={`${s.muscle}-${i}`}>
              <path {...props} />
              {s.mirror && (
                <g transform="translate(200,0) scale(-1,1)">
                  <path {...props} />
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
