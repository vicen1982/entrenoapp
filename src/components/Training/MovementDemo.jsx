import { PATTERNS, inferPattern } from './movementPatterns'

/*
 * Demo animada de ejecución: figura lateral que interpola entre la pose de
 * inicio y la de fin del patrón del ejercicio. Usa SMIL (<animate>) para que
 * el movimiento sea continuo y suave sin JS ni librerías.
 */

const EASE = '0.45 0 0.25 1;0.45 0 0.25 1'
const TIMES = '0;0.5;1'

function seq(from, to) {
  return `${from};${to};${from}`
}

function AnimLine({ a1, a2, b1, b2, dur, color = '#2ee6a8', width = 3.4 }) {
  const common = {
    dur,
    repeatCount: 'indefinite',
    calcMode: 'spline',
    keySplines: EASE,
    keyTimes: TIMES,
  }
  return (
    <line
      x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]}
      stroke={color} strokeWidth={width} strokeLinecap="round"
    >
      <animate attributeName="x1" values={seq(a1[0], b1[0])} {...common} />
      <animate attributeName="y1" values={seq(a1[1], b1[1])} {...common} />
      <animate attributeName="x2" values={seq(a2[0], b2[0])} {...common} />
      <animate attributeName="y2" values={seq(a2[1], b2[1])} {...common} />
    </line>
  )
}

function AnimCircle({ a, b, r, dur, fill = '#2ee6a8' }) {
  const common = {
    dur,
    repeatCount: 'indefinite',
    calcMode: 'spline',
    keySplines: EASE,
    keyTimes: TIMES,
  }
  return (
    <circle cx={a[0]} cy={a[1]} r={r} fill={fill}>
      <animate attributeName="cx" values={seq(a[0], b[0])} {...common} />
      <animate attributeName="cy" values={seq(a[1], b[1])} {...common} />
    </circle>
  )
}

// Barra / mancuerna que sigue la mano (o la cadera en el hip thrust)
function AnimProp({ pose, poseB, kind, dur }) {
  if (!kind) return null
  const common = {
    dur,
    repeatCount: 'indefinite',
    calcMode: 'spline',
    keySplines: EASE,
    keyTimes: TIMES,
  }

  if (kind === 'overhead') {
    return <line x1="26" y1="10" x2="74" y2="10" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
  }

  const a = kind === 'hip' ? pose.hip : pose.hand
  const b = kind === 'hip' ? poseB.hip : poseB.hand
  const half = 11

  return (
    <line
      x1={a[0] - half} y1={a[1]} x2={a[0] + half} y2={a[1]}
      stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round"
    >
      <animate attributeName="x1" values={seq(a[0] - half, b[0] - half)} {...common} />
      <animate attributeName="y1" values={seq(a[1], b[1])} {...common} />
      <animate attributeName="x2" values={seq(a[0] + half, b[0] + half)} {...common} />
      <animate attributeName="y2" values={seq(a[1], b[1])} {...common} />
    </line>
  )
}

export default function MovementDemo({ exercise, size = 130, showLabel = true }) {
  const key = inferPattern(exercise)
  const pattern = PATTERNS[key] ?? PATTERNS.squat
  const { a, b } = pattern
  const dur = pattern.a.hold ? '3.2s' : '2.1s'

  const limb = (j1, j2) => ({
    a1: a[j1], a2: a[j2], b1: b[j1], b2: b[j2], dur,
  })

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="rounded-2xl border border-panel-border overflow-hidden"
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(circle at 50% 45%, #16202f 0%, #0b0f17 80%)',
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* piso */}
          <line x1="8" y1="96" x2="92" y2="96" stroke="#1e2a3d" strokeWidth="2" strokeLinecap="round" />

          {/* pierna, torso, brazo */}
          <AnimLine {...limb('hip', 'knee')} />
          <AnimLine {...limb('knee', 'foot')} />
          <AnimLine {...limb('neck', 'hip')} width={4} />
          <AnimLine {...limb('neck', 'elbow')} width={3} />
          <AnimLine {...limb('elbow', 'hand')} width={3} />

          {/* cabeza */}
          <AnimCircle a={a.head} b={b.head} r={7} dur={dur} />

          {/* implemento */}
          <AnimProp pose={a} poseB={b} kind={a.bar} dur={dur} />
        </svg>
      </div>
      {showLabel && (
        <span className="text-[9px] text-slate-500 tracking-widest font-mono text-center">
          {pattern.label.toUpperCase()}
        </span>
      )}
    </div>
  )
}
