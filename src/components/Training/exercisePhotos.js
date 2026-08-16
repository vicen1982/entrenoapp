/*
 * Fotos reales de ejecución tomadas de free-exercise-db (dominio público),
 * servidas por jsDelivr. Cada ejercicio tiene 2 frames: posición inicial y
 * final, que alternamos para mostrar el movimiento como hacen las apps de
 * entrenamiento profesionales.
 */

const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises'

// Reglas nombre (normalizado, sin tildes) -> id del ejercicio en la base.
// Se evalúan en orden: las variantes más específicas van primero.
const RULES = [
  // Piernas / cadera
  ['hip thrust', 'Barbell_Hip_Thrust'],
  ['puente de gluteo', 'Barbell_Glute_Bridge'],
  ['prensa', 'Leg_Press'],
  ['bulgara', 'Split_Squat_with_Dumbbells'],
  ['split squat', 'Split_Squat_with_Dumbbells'],
  ['peso muerto rumano', 'Romanian_Deadlift'],
  ['rdl', 'Romanian_Deadlift'],
  ['step-up', 'Dumbbell_Step_Ups'],
  ['step up', 'Dumbbell_Step_Ups'],
  ['subida explosiva', 'Dumbbell_Step_Ups'],
  ['sentadilla con salto', 'Freehand_Jump_Squat'],
  ['squat explosivo', 'Freehand_Jump_Squat'],
  ['sentadilla', 'Freehand_Jump_Squat'],

  ['estocada lateral', 'Barbell_Side_Split_Squat'],
  ['cossack', 'Barbell_Side_Split_Squat'],

  // Pliometría
  ['patinador', 'Lateral_Bound'],
  ['skater', 'Lateral_Bound'],
  ['salto al cajon', 'Front_Box_Jump'],
  ['box jump', 'Front_Box_Jump'],
  ['drop jump', 'Front_Box_Jump'],
  ['cajon', 'Front_Box_Jump'],

  // Empuje
  ['press inclinado', 'Incline_Dumbbell_Press'],
  ['floor press', 'Dumbbell_Floor_Press'],
  ['press militar', 'Standing_Military_Press'],
  ['press arnold', 'Arnold_Dumbbell_Press'],
  ['arnold', 'Arnold_Dumbbell_Press'],
  ['elevaciones laterales', 'Seated_Side_Lateral_Raise'],
  ['elevacion lateral', 'Seated_Side_Lateral_Raise'],
  ['flexiones', 'Pushups'],
  ['push up', 'Pushups'],
  ['landmine', 'Landmine_180s'],

  // Tracción
  ['remo con mancuerna', 'One-Arm_Dumbbell_Row'],
  ['remo gorila', 'Bent_Over_Two-Dumbbell_Row'],
  ['gorilla row', 'Bent_Over_Two-Dumbbell_Row'],
  ['remo pendlay', 'Bent_Over_Barbell_Row'],
  ['remo barra t', 'T-Bar_Row_with_Handle'],
  ['remo renegado', 'Bent_Over_Two-Dumbbell_Row'],
  ['renegade', 'Bent_Over_Two-Dumbbell_Row'],
  ['remo', 'Bent_Over_Barbell_Row'],
  ['jalon al pecho', 'Full_Range-Of-Motion_Lat_Pulldown'],
  ['jalon', 'Full_Range-Of-Motion_Lat_Pulldown'],
  ['dominada', 'Pullups'],
  ['pull-up', 'Pullups'],
  ['pullup', 'Pullups'],

  // Brazos
  ['curl martillo', 'Hammer_Curls'],
  ['agarre martillo', 'Hammer_Curls'],
  ['curl de biceps', 'Dumbbell_Bicep_Curl'],
  ['curl', 'Dumbbell_Bicep_Curl'],
  ['triceps en polea', 'Triceps_Pushdown'],
  ['triceps', 'Triceps_Pushdown'],
  ['fondos', 'Dips_-_Triceps_Version'],

  // Core
  ['pallof', 'Pallof_Press'],
  ['dead bug', 'Dead_Bug'],
  ['bicho muerto', 'Dead_Bug'],
  ['plancha abdominal', 'Plank'],
  ['plancha frontal', 'Plank'],
  ['plancha', 'Plank'],
  ['balon medicinal', 'Medicine_Ball_Scoop_Throw'],
  ['slam', 'Medicine_Ball_Scoop_Throw'],
  ['lanzamiento', 'Medicine_Ball_Scoop_Throw'],
  ['caminata de granjero', 'Farmers_Walk'],
  ['suitcase carry', 'Farmers_Walk'],
  ['granjero', 'Farmers_Walk'],
  ['hanging leg', 'Hanging_Leg_Raise'],

  // VO2 / cardio
  ['kettlebell swing', 'One-Arm_Kettlebell_Swings'],
  ['swing', 'One-Arm_Kettlebell_Swings'],
  ['mountain climber', 'Mountain_Climbers'],
  ['escalador', 'Mountain_Climbers'],
  ['battle rope', 'Battling_Ropes'],
  ['soga', 'Battling_Ropes'],
  ['bici', 'Bicycling_Stationary'],
  ['bicicleta', 'Bicycling_Stationary'],

  // Mantenimiento / movilidad
  ['caballero', 'Kneeling_Hip_Flexor'],
  ['psoas', 'Kneeling_Hip_Flexor'],
  ['caminata de oso', 'Spider_Crawl'],
  ['bear crawl', 'Spider_Crawl'],
  ['elevacion de talon', 'Standing_Calf_Raises'],
  ['talon', 'Standing_Calf_Raises'],
  ['gemelo', 'Standing_Calf_Raises'],
  ['snatch', 'Hang_Snatch'],
  ['arranque', 'Hang_Snatch'],
]

const norm = (s) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function photoIdFor(exercise) {
  if (!exercise?.name) return null
  const name = norm(exercise.name)
  for (const [key, id] of RULES) {
    if (name.includes(key)) return id
  }
  return null
}

export function photoUrls(id) {
  if (!id) return []
  return [`${CDN}/${id}/0.jpg`, `${CDN}/${id}/1.jpg`]
}
