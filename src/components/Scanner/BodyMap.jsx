import { heatColor } from '../../store/useHeatmap'

/*
 * Mapa anatómico estilizado. Cada zona es un shape con id de músculo
 * que matchea el vocabulario del catálogo (exercises.muscles).
 * Shapes con mirror:true se duplican espejados (lado derecho).
 */

const FRONT_SHAPES = [
  { muscle: 'deltoides', el: 'ellipse', cx: 68, cy: 66, rx: 11, ry: 9, mirror: true },
  { muscle: 'pectoral', el: 'rect', x: 77, y: 72, w: 22, h: 26, rx: 7, mirror: true },
  { muscle: 'biceps', el: 'rect', x: 57, y: 90, w: 12, h: 36, rx: 6, mirror: true },
  { muscle: 'antebrazos', el: 'rect', x: 52, y: 132, w: 11, h: 40, rx: 5, mirror: true },
  { muscle: 'core', el: 'rect', x: 88, y: 104, w: 24, h: 50, rx: 7 },
  { muscle: 'oblicuos', el: 'rect', x: 76, y: 106, w: 10, h: 44, rx: 5, mirror: true },
  { muscle: 'abductores', el: 'rect', x: 66, y: 160, w: 13, h: 30, rx: 6, mirror: true },
  { muscle: 'aductores', el: 'rect', x: 86, y: 180, w: 12, h: 40, rx: 6, mirror: true },
  { muscle: 'cuadriceps', el: 'rect', x: 68, y: 176, w: 16, h: 66, rx: 8, mirror: true },
]

const BACK_SHAPES = [
  { muscle: 'trapecio', el: 'poly', points: '100,46 122,56 104,94 96,94 78,56' },
  { muscle: 'deltoides', el: 'ellipse', cx: 68, cy: 66, rx: 11, ry: 9, mirror: true },
  { muscle: 'romboides', el: 'rect', x: 81, y: 82, w: 16, h: 20, rx: 5, mirror: true },
  { muscle: 'dorsales', el: 'rect', x: 75, y: 104, w: 21, h: 42, rx: 9, mirror: true },
  { muscle: 'triceps', el: 'rect', x: 57, y: 90, w: 12, h: 36, rx: 6, mirror: true },
  { muscle: 'antebrazos', el: 'rect', x: 52, y: 132, w: 11, h: 40, rx: 5, mirror: true },
  { muscle: 'lumbar', el: 'rect', x: 88, y: 148, w: 24, h: 24, rx: 7 },
  { muscle: 'gluteos', el: 'rect', x: 76, y: 176, w: 23, h: 32, rx: 10, mirror: true },
  { muscle: 'isquiotibiales', el: 'rect', x: 72, y: 212, w: 16, h: 48, rx: 8, mirror: true },
  { muscle: 'gemelos', el: 'rect', x: 74, y: 274, w: 15, h: 36, rx: 7, mirror: true },
  { muscle: 'soleo', el: 'rect', x: 78, y: 314, w: 11, h: 26, rx: 5, mirror: true },
]

const SILHOUETTE = `
  M100,42 C88,42 80,46 72,50 C60,54 54,62 54,74 C54,84 56,92 56,100
  C56,116 52,130 50,148 C48,162 48,172 50,178 L60,178
  C62,168 64,158 66,148 C68,136 70,124 72,116
  L74,160 C74,176 72,190 72,204 C72,232 74,258 76,280
  C78,304 78,326 78,344 L92,344 C92,326 92,304 94,280
  C96,258 98,240 100,228 C102,240 104,258 106,280
  C108,304 108,326 108,344 L122,344 C122,326 122,304 124,280
  C126,258 128,232 128,204 C128,190 126,176 126,160
  L128,116 C130,124 132,136 134,148 C136,158 138,168 140,178 L150,178
  C152,172 152,162 150,148 C148,130 144,116 144,100
  C144,92 146,84 146,74 C146,62 140,54 128,50 C120,46 112,42 100,42 Z
`

function Shape({ shape, fill, selected, onSelect }) {
  const common = {
    fill,
    stroke: selected ? '#2ee6a8' : '#223047',
    strokeWidth: selected ? 2 : 1,
    className: 'cursor-pointer transition-all duration-300',
    onClick: () => onSelect(shape.muscle),
  }
  if (shape.el === 'ellipse') {
    return <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...common} />
  }
  if (shape.el === 'poly') {
    return <polygon points={shape.points} strokeLinejoin="round" {...common} />
  }
  return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...common} />
}

function Figure({ shapes, muscleData, selected, onSelect }) {
  const fillFor = (muscle) => heatColor(muscleData[muscle]?.heat ?? 0)

  return (
    <svg viewBox="0 0 200 360" className="w-full h-auto">
      {/* Silueta */}
      <circle cx="100" cy="26" r="13" fill="none" stroke="#223047" strokeWidth="1.5" />
      <path d={SILHOUETTE} fill="#0e141f" stroke="#223047" strokeWidth="1.5" />

      {/* Zonas musculares */}
      {shapes.map((s, i) => (
        <g key={`${s.muscle}-${i}`}>
          <Shape shape={s} fill={fillFor(s.muscle)} selected={selected === s.muscle} onSelect={onSelect} />
          {s.mirror && (
            <g transform="translate(200,0) scale(-1,1)">
              <Shape shape={s} fill={fillFor(s.muscle)} selected={selected === s.muscle} onSelect={onSelect} />
            </g>
          )}
        </g>
      ))}
    </svg>
  )
}

export default function BodyMap({ view, muscleData, selected, onSelect }) {
  return (
    <Figure
      shapes={view === 'back' ? BACK_SHAPES : FRONT_SHAPES}
      muscleData={muscleData}
      selected={selected}
      onSelect={onSelect}
    />
  )
}

// Músculos profundos / sistemas sin representación en el mapa
export const DEEP_MUSCLES = ['psoas', 'transverso', 'cardio']

export const MUSCLE_VIEWS = { front: FRONT_SHAPES, back: BACK_SHAPES }
export { SILHOUETTE }
