import { heatColor } from '../../store/useHeatmap'

/*
 * Mapa anatómico. Cada grupo muscular es un path con forma real (no cajas),
 * ubicado sobre una silueta simétrica. El id de cada uno matchea el
 * vocabulario del catálogo (exercises.muscles).
 *
 * Coordenadas en viewBox 0 0 200 400. Los shapes con mirror:true se dibujan
 * también espejados sobre el eje x=100. `box` es el bounding box aproximado,
 * usado para hacer zoom en las miniaturas.
 */

// Media silueta (lado izquierdo); se espeja para garantizar simetría
export const SILHOUETTE_HALF = `
  M100,46
  C90,46 83,49 79,55 C70,61 59,65 53,74 C47,83 45,95 44,107
  C43,122 42,136 41,150 C40,163 39,173 39,183
  C39,195 40,205 42,212 C43,218 47,221 50,220 C54,219 56,214 55,206
  C54,195 55,184 56,173 C57,160 59,147 61,135 C63,123 65,112 67,103
  C68,118 69,138 70,158 C71,176 72,189 73,200
  C73,212 74,224 75,238 C76,258 77,278 78,298 C79,316 79,330 79,342
  C79,356 80,370 81,382 C82,391 84,396 87,397 C91,398 94,395 95,388
  C96,377 96,364 96,350 C96,334 96,318 97,302 C97,284 98,266 99,248
  C99,240 100,236 100,232 Z
`

const FRONT_SHAPES = [
  {
    muscle: 'deltoides', mirror: true, box: [52, 60, 84, 94],
    d: 'M56,74 C63,64 74,61 81,66 C84,73 82,84 77,90 C68,95 59,90 56,82 Z',
  },
  {
    muscle: 'pectoral', mirror: true, box: [79, 64, 100, 101],
    d: 'M83,70 C90,65 96,65 99,67 L99,97 C91,100 84,96 81,88 C79,81 80,74 83,70 Z',
  },
  {
    muscle: 'biceps', mirror: true, box: [46, 92, 66, 134],
    d: 'M50,97 C56,92 62,94 64,101 C66,111 64,123 60,131 C55,134 50,131 48,125 C47,114 47,104 50,97 Z',
  },
  {
    muscle: 'antebrazos', mirror: true, box: [40, 134, 59, 184],
    d: 'M45,139 C50,135 55,137 57,144 C58,156 56,171 52,181 C48,184 44,182 42,176 C41,163 42,149 45,139 Z',
  },
  {
    muscle: 'core', box: [86, 99, 114, 160],
    d: 'M88,103 C94,100 106,100 112,103 C114,119 114,141 112,157 C106,160 94,160 88,157 C86,141 86,119 88,103 Z',
  },
  {
    muscle: 'oblicuos', mirror: true, box: [73, 101, 88, 156],
    d: 'M76,105 C81,102 85,104 86,111 C87,125 86,141 84,153 C80,155 76,152 75,146 C74,132 74,117 76,105 Z',
  },
  {
    muscle: 'abductores', mirror: true, box: [67, 163, 84, 204],
    d: 'M70,169 C75,164 80,166 82,173 C83,183 82,193 80,201 C76,204 72,202 70,196 C68,187 68,177 70,169 Z',
  },
  {
    muscle: 'aductores', mirror: true, box: [88, 176, 101, 240],
    d: 'M92,181 C96,178 99,180 100,187 C100,205 99,223 97,237 C94,240 91,238 90,232 C89,215 89,197 92,181 Z',
  },
  {
    muscle: 'cuadriceps', mirror: true, box: [73, 175, 98, 262],
    d: 'M76,181 C84,176 92,178 95,187 C97,207 96,233 93,255 C89,261 82,260 79,253 C76,231 74,203 76,181 Z',
  },
  {
    muscle: 'gemelos', mirror: true, box: [78, 285, 97, 332],
    d: 'M81,290 C87,285 93,287 95,294 C96,307 95,319 92,329 C88,333 82,332 80,326 C78,314 79,299 81,290 Z',
  },
]

const BACK_SHAPES = [
  {
    muscle: 'trapecio', box: [69, 50, 131, 106],
    d: 'M100,52 C112,54 124,61 130,69 C126,81 118,93 110,101 L100,105 L90,101 C82,93 74,81 70,69 C76,61 88,54 100,52 Z',
  },
  {
    muscle: 'deltoides', mirror: true, box: [52, 60, 84, 94],
    d: 'M56,74 C63,64 74,61 81,66 C84,73 82,84 77,90 C68,95 59,90 56,82 Z',
  },
  {
    muscle: 'romboides', mirror: true, box: [81, 83, 100, 113],
    d: 'M84,87 C90,84 96,84 99,87 L99,111 C93,112 86,109 83,103 C82,97 82,91 84,87 Z',
  },
  {
    muscle: 'dorsales', mirror: true, box: [64, 101, 97, 160],
    d: 'M68,105 C76,102 86,104 92,111 C96,123 96,141 92,155 C84,161 74,158 69,149 C66,135 65,119 68,105 Z',
  },
  {
    muscle: 'triceps', mirror: true, box: [44, 92, 64, 136],
    d: 'M48,97 C54,92 60,94 62,101 C64,113 62,125 58,133 C53,136 48,133 46,127 C45,115 45,105 48,97 Z',
  },
  {
    muscle: 'antebrazos', mirror: true, box: [40, 134, 59, 184],
    d: 'M45,139 C50,135 55,137 57,144 C58,156 56,171 52,181 C48,184 44,182 42,176 C41,163 42,149 45,139 Z',
  },
  {
    muscle: 'lumbar', box: [86, 147, 114, 188],
    d: 'M88,151 C94,148 106,148 112,151 C114,161 114,175 112,185 C106,188 94,188 88,185 C86,175 86,161 88,151 Z',
  },
  {
    muscle: 'gluteos', mirror: true, box: [71, 175, 101, 222],
    d: 'M74,183 C84,177 94,179 99,187 C100,199 99,211 95,219 C87,223 78,220 74,211 C72,201 72,191 74,183 Z',
  },
  {
    muscle: 'isquiotibiales', mirror: true, box: [75, 217, 98, 284],
    d: 'M78,223 C86,218 93,221 96,229 C97,247 96,265 93,279 C89,284 82,283 79,276 C77,259 76,239 78,223 Z',
  },
  {
    muscle: 'gemelos', mirror: true, box: [77, 283, 97, 332],
    d: 'M80,289 C87,284 93,286 95,293 C96,306 95,318 92,328 C88,332 82,331 80,325 C78,313 78,298 80,289 Z',
  },
  {
    muscle: 'soleo', mirror: true, box: [80, 326, 95, 362],
    d: 'M82,331 C87,328 92,329 93,335 C94,345 93,353 91,359 C88,362 84,361 83,356 C81,348 81,338 82,331 Z',
  },
]

export const MUSCLE_VIEWS = { front: FRONT_SHAPES, back: BACK_SHAPES }

// Músculos profundos / sistemas sin representación en superficie
export const DEEP_MUSCLES = ['psoas', 'transverso', 'cardio']

function Silhouette() {
  return (
    <g>
      <circle cx="100" cy="27" r="17" fill="#131b29" stroke="#26324a" strokeWidth="1.6" />
      <path d={SILHOUETTE_HALF} fill="#131b29" stroke="#26324a" strokeWidth="1.6" strokeLinejoin="round" />
      <g transform="translate(200,0) scale(-1,1)">
        <path d={SILHOUETTE_HALF} fill="#131b29" stroke="#26324a" strokeWidth="1.6" strokeLinejoin="round" />
      </g>
    </g>
  )
}

function Muscle({ shape, fill, selected, onSelect }) {
  const props = {
    d: shape.d,
    fill,
    stroke: selected ? '#2ee6a8' : '#2b3852',
    strokeWidth: selected ? 1.8 : 0.9,
    strokeLinejoin: 'round',
    onClick: onSelect ? () => onSelect(shape.muscle) : undefined,
    className: onSelect ? 'cursor-pointer transition-all duration-300' : 'transition-all duration-300',
  }
  return (
    <g>
      <path {...props} />
      {shape.mirror && (
        <g transform="translate(200,0) scale(-1,1)">
          <path {...props} />
        </g>
      )}
    </g>
  )
}

export default function BodyMap({ view, muscleData, selected, onSelect }) {
  const shapes = view === 'back' ? BACK_SHAPES : FRONT_SHAPES
  return (
    <svg viewBox="0 0 200 400" className="w-full h-auto">
      <Silhouette />
      {shapes.map((s, i) => (
        <Muscle
          key={`${s.muscle}-${i}`}
          shape={s}
          fill={heatColor(muscleData[s.muscle]?.heat ?? 0)}
          selected={selected === s.muscle}
          onSelect={onSelect}
        />
      ))}
    </svg>
  )
}
