/*
 * Patrones de movimiento para la demo animada de ejecución.
 * Cada patrón define dos poses (inicio / fin) de una figura lateral; la demo
 * interpola entre ambas, que es como se lee un movimiento en una guía técnica.
 *
 * Articulaciones (viewBox 100x100, vista de perfil):
 *   head, neck, hip, elbow, hand, knee, foot
 * Props opcionales: bar (barra/mancuerna en la mano), box (cajón), floor (línea)
 */

const P = (head, neck, hip, elbow, hand, knee, foot, extra = {}) => ({
  head, neck, hip, elbow, hand, knee, foot, ...extra,
})

export const PATTERNS = {
  // --- Sentadilla / estocada: bajar y subir ---
  squat: {
    label: 'Flexión de rodilla y cadera',
    a: P([50, 16], [50, 27], [50, 54], [44, 40], [44, 53], [52, 74], [50, 92], { bar: 'hand' }),
    b: P([46, 30], [47, 41], [45, 63], [40, 52], [40, 64], [60, 72], [50, 92], { bar: 'hand' }),
  },

  // --- Bisagra de cadera: RDL, swing, buenos días ---
  hinge: {
    label: 'Bisagra de cadera',
    a: P([50, 16], [50, 27], [50, 54], [50, 40], [50, 52], [50, 74], [50, 92], { bar: 'hand' }),
    b: P([32, 34], [37, 40], [55, 52], [40, 52], [43, 66], [56, 72], [52, 92], { bar: 'hand' }),
  },

  // --- Puente de glúteo / hip thrust: subir cadera ---
  bridge: {
    label: 'Extensión de cadera',
    a: P([22, 62], [32, 64], [56, 76], [30, 74], [42, 76], [70, 66], [78, 88], { bar: 'hip' }),
    b: P([22, 60], [32, 60], [58, 58], [30, 72], [44, 62], [72, 62], [78, 88], { bar: 'hip' }),
  },

  // --- Empuje horizontal: press banca, floor press, flexiones ---
  push_horizontal: {
    label: 'Empuje horizontal',
    a: P([24, 60], [34, 62], [62, 66], [40, 54], [40, 44], [76, 62], [86, 76], { bar: 'hand' }),
    b: P([24, 60], [34, 62], [62, 66], [36, 50], [34, 34], [76, 62], [86, 76], { bar: 'hand' }),
  },

  // --- Empuje vertical: press militar, arnold ---
  push_vertical: {
    label: 'Empuje vertical',
    a: P([50, 20], [50, 31], [50, 58], [40, 40], [44, 30], [50, 74], [50, 92], { bar: 'hand' }),
    b: P([50, 20], [50, 31], [50, 58], [46, 26], [48, 10], [50, 74], [50, 92], { bar: 'hand' }),
  },

  // --- Tracción vertical: dominadas, jalón, dead hang ---
  pull_vertical: {
    label: 'Tracción vertical',
    a: P([50, 30], [50, 40], [50, 66], [50, 24], [50, 10], [50, 80], [50, 94], { bar: 'overhead' }),
    b: P([50, 18], [50, 28], [50, 56], [38, 20], [50, 10], [50, 70], [50, 86], { bar: 'overhead' }),
  },

  // --- Tracción horizontal: remos ---
  pull_horizontal: {
    label: 'Tracción horizontal',
    a: P([30, 34], [36, 40], [56, 52], [38, 58], [38, 72], [58, 72], [54, 92], { bar: 'hand' }),
    b: P([30, 34], [36, 40], [56, 52], [46, 50], [40, 58], [58, 72], [54, 92], { bar: 'hand' }),
  },

  // --- Flexión de brazo: curl, tríceps, fondos ---
  curl: {
    label: 'Flexión de codo',
    a: P([50, 18], [50, 29], [50, 56], [50, 44], [50, 60], [50, 74], [50, 92], { bar: 'hand' }),
    b: P([50, 18], [50, 29], [50, 56], [50, 44], [42, 34], [50, 74], [50, 92], { bar: 'hand' }),
  },

  // --- Salto / pliometría ---
  jump: {
    label: 'Salto explosivo',
    a: P([48, 30], [48, 40], [46, 62], [54, 50], [58, 60], [58, 72], [50, 92], {}),
    b: P([52, 8], [52, 20], [54, 44], [46, 12], [42, 4], [56, 62], [58, 80], {}),
  },

  // --- Salto lateral / patinador ---
  lateral: {
    label: 'Desplazamiento lateral',
    a: P([34, 26], [36, 36], [40, 58], [28, 44], [22, 54], [34, 74], [28, 92], {}),
    b: P([66, 26], [64, 36], [60, 58], [72, 44], [78, 54], [66, 74], [72, 92], {}),
  },

  // --- Plancha / isométrico ---
  plank: {
    label: 'Isométrico',
    a: P([20, 52], [30, 55], [58, 62], [26, 66], [24, 78], [74, 66], [88, 78], { hold: true }),
    b: P([20, 54], [30, 57], [58, 63], [26, 67], [24, 78], [74, 67], [88, 78], { hold: true }),
  },

  // --- Anti-rotación / rotación: pallof, balón medicinal ---
  rotation: {
    label: 'Rotación / anti-rotación',
    a: P([50, 18], [50, 29], [50, 56], [40, 40], [34, 44], [48, 74], [46, 92], {}),
    b: P([54, 18], [53, 29], [50, 56], [64, 40], [74, 42], [52, 74], [46, 92], {}),
  },

  // --- Caminata cargada / bear crawl ---
  carry: {
    label: 'Desplazamiento cargado',
    a: P([50, 16], [50, 27], [50, 54], [50, 40], [50, 56], [44, 74], [38, 92], { bar: 'hand' }),
    b: P([50, 16], [50, 27], [50, 54], [50, 40], [50, 56], [58, 74], [64, 92], { bar: 'hand' }),
  },

  // --- Cíclico: bici, escalera, mountain climbers ---
  cyclic: {
    label: 'Movimiento cíclico',
    a: P([48, 22], [48, 33], [50, 58], [42, 44], [36, 50], [38, 70], [34, 86], {}),
    b: P([48, 22], [48, 33], [50, 58], [42, 44], [36, 50], [62, 68], [66, 84], {}),
  },

  // --- Movilidad / estiramiento ---
  stretch: {
    label: 'Movilidad',
    a: P([46, 26], [46, 37], [48, 60], [38, 48], [34, 60], [36, 78], [26, 92], {}),
    b: P([52, 20], [51, 32], [48, 58], [58, 44], [66, 36], [40, 78], [28, 92], {}),
  },

  // --- Elevación de talón ---
  calf: {
    label: 'Flexión plantar',
    a: P([50, 20], [50, 31], [50, 58], [44, 44], [44, 58], [50, 76], [50, 94], {}),
    b: P([50, 14], [50, 25], [50, 52], [44, 38], [44, 52], [50, 70], [50, 88], {}),
  },
}

// Palabras clave por patrón, evaluadas en orden (la primera que matchea gana)
const RULES = [
  // Los circuitos mezclan movimientos: se muestran como trabajo cíclico
  ['cyclic', ['circuito', 'metabolico']],
  ['bridge', ['hip thrust', 'puente', 'gluteo bridge']],
  ['pull_vertical', ['dominada', 'jalon', 'pull-up', 'pull up', 'dead hang', 'colgad']],
  ['pull_horizontal', ['remo', 'row', 'renegade']],
  ['push_vertical', ['press militar', 'arnold', 'overhead', 'landmine press', 'elevaciones laterales']],
  ['push_horizontal', ['press inclinado', 'floor press', 'press de banca', 'banca', 'flexion', 'push up', 'fondos']],
  ['curl', ['curl', 'triceps', 'biceps']],
  // carry va antes que lateral: "Caminata de Granjero (Bilateral)" contiene "lateral"
  ['carry', ['caminata', 'carry', 'granjero', 'farmer', 'suitcase', 'oso', 'bear crawl']],
  ['lateral', ['patinador', 'skater', 'slalom', 'lateral', 'cossack', 'escalera', 'icky', 'repiqueteo']],
  ['jump', ['salto', 'jump', 'pliometr', 'snatch', 'arranque', 'explosiv']],
  ['plank', ['plancha', 'plank', 'copenhagen', 'dead bug', 'bicho muerto', 'isometric']],
  ['rotation', ['pallof', 'rotacion', 'rotacional', 'balon', 'slam', 'libro abierto', 'anti-rotacion']],
  ['cyclic', ['bici', 'bicicleta', 'sprint', 'mountain climber', 'escalador', 'battle rope', 'soga', 'circuito', 'cardio']],
  ['stretch', ['caballero', 'psoas', 'estiramiento', 'movilidad', '90/90', '9090', 'descompresion']],
  ['calf', ['talon', 'gemelo', 'soleo', 'hsr', 'pantorrilla']],
  ['hinge', ['peso muerto', 'rdl', 'rumano', 'swing', 'kettlebell', 'gorila', 'gorilla', 'bisagra', 'pendlay']],
  ['squat', ['sentadilla', 'squat', 'prensa', 'bulgara', 'estocada', 'lunge', 'step-up', 'step up', 'zancada']],
]

// Fallback por músculo principal si el nombre no dice nada
const BY_MUSCLE = {
  pectoral: 'push_horizontal',
  deltoides: 'push_vertical',
  dorsales: 'pull_horizontal',
  trapecio: 'pull_horizontal',
  romboides: 'pull_horizontal',
  biceps: 'curl',
  triceps: 'curl',
  antebrazos: 'carry',
  gluteos: 'hinge',
  isquiotibiales: 'hinge',
  cuadriceps: 'squat',
  aductores: 'plank',
  abductores: 'lateral',
  gemelos: 'calf',
  soleo: 'calf',
  core: 'plank',
  oblicuos: 'rotation',
  transverso: 'plank',
  lumbar: 'hinge',
  psoas: 'stretch',
  cardio: 'cyclic',
}

const norm = (s) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function inferPattern(exercise) {
  if (!exercise) return 'squat'
  const name = norm(exercise.name)

  for (const [pattern, keywords] of RULES) {
    if (keywords.some((k) => name.includes(k))) return pattern
  }

  const muscles = exercise.muscles || []
  for (const m of muscles) {
    if (BY_MUSCLE[m]) return BY_MUSCLE[m]
  }
  return 'squat'
}
