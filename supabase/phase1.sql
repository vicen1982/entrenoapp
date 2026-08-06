-- ============================================================
-- ENGANCHE_OS — FASE 1: Fundación
-- Catálogo de ejercicios + estructura de tracking, nutrición
-- e historial clínico. Ejecutar en Supabase SQL Editor.
-- ============================================================

-- ---------- MÓDULOS (las 8 categorías del catálogo) ----------
create table if not exists modules (
  id text primary key,
  name text not null,
  subtitle text,
  sort_order integer not null default 0
);

-- ---------- EJERCICIOS (catálogo: seed + inserciones dinámicas) ----------
-- muscles: array jsonb con ids que matchean el SVG del Body Scanner (Fase 3).
-- Vocabulario: cuadriceps, isquiotibiales, gluteos, aductores, abductores,
--   gemelos, soleo, core, oblicuos, transverso, lumbar, dorsales, trapecio,
--   romboides, pectoral, deltoides, biceps, triceps, antebrazos, psoas, cardio
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  module text not null references modules(id),
  muscles jsonb not null default '[]'::jsonb,
  measure_type text not null default 'reps' check (measure_type in ('reps', 'seconds')),
  default_sets integer default 3,
  default_reps text default '10',
  tempo text,
  rest_seconds integer default 60,
  notes text,
  warnings jsonb default '[]'::jsonb,
  rehab_priority text default 'normal' check (rehab_priority in ('critica', 'alta', 'normal')),
  soleo_load boolean not null default false,   -- true => excluido en Protocolo Bypass
  priming_ok boolean not null default false,   -- true => permitido en Neural Priming
  is_custom boolean not null default false,
  created_at timestamptz default now()
);

-- ---------- SESIONES DE ENTRENAMIENTO ----------
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  protocol_id text not null default 'standard' check (protocol_id in ('standard', 'bypass', 'neural_priming')),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at timestamptz default now(),
  finished_at timestamptz,
  notes text
);

-- ---------- REGISTRO DE SERIES (el corazón del tracker) ----------
create table if not exists set_logs (
  id bigint generated always as identity primary key,
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  set_number integer not null,
  weight_kg numeric(6,2),
  reps integer,            -- para measure_type = reps
  seconds integer,         -- para measure_type = seconds
  rpe integer check (rpe between 1 and 10),
  completed boolean not null default false,
  completed_at timestamptz
);

-- ---------- COMBUSTIBLE (nutrición) ----------
create table if not exists meals (
  id bigint generated always as identity primary key,
  date date not null default current_date,
  meal_type text not null check (meal_type in ('desayuno', 'almuerzo', 'merienda', 'cena', 'snack')),
  description text not null,
  protein_g numeric(6,1) default 0,
  carbs_g numeric(6,1) default 0,
  fat_g numeric(6,1) default 0,
  calories numeric(7,1) default 0,
  logged_at timestamptz default now()
);

-- ---------- MÉTRICAS CORPORALES ----------
create table if not exists body_metrics (
  id bigint generated always as identity primary key,
  date date not null default current_date,
  weight_kg numeric(5,2) not null,
  notes text
);

-- ---------- HISTORIAL CLÍNICO ----------
create table if not exists medical_records (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  record_type text not null check (record_type in ('estudio', 'consulta', 'lesion', 'otro')),
  title text not null,
  description text,
  results jsonb default '{}'::jsonb,
  attachment_url text,
  created_at timestamptz default now()
);

-- ---------- ÍNDICES ----------
create index if not exists idx_set_logs_session on set_logs(session_id);
create index if not exists idx_set_logs_exercise on set_logs(exercise_id);
create index if not exists idx_sessions_date on workout_sessions(date);
create index if not exists idx_meals_date on meals(date);
create index if not exists idx_body_metrics_date on body_metrics(date);
create index if not exists idx_medical_date on medical_records(date);

-- ============================================================
-- SEED: 8 MÓDULOS
-- ============================================================
insert into modules (id, name, subtitle, sort_order) values
  ('potencia',      'Potencia y Pliometría',          'Laboratorio 1v1',      1),
  ('piernas',       'Fuerza de Piernas',              'Motor V8',             2),
  ('empuje',        'Armadura Frontal y Hombros',     'El Chasis',            3),
  ('traccion',      'Espalda de CEO',                 'Postura Dominante',    4),
  ('brazos',        'Bombeo Estético',                'Chapa y Pintura',      5),
  ('core',          'Core y Prevención',              'Núcleo y Antivirus',   6),
  ('vo2max',        'VO2 Max',                        'Segundo Aire',         7),
  ('descompresion', 'Descompresión y Mantenimiento',  'WD-40',                8)
on conflict (id) do nothing;

-- ============================================================
-- SEED: CATÁLOGO DE EJERCICIOS
-- ============================================================
insert into exercises
  (slug, name, module, muscles, measure_type, default_sets, default_reps, tempo, rest_seconds, notes, warnings, rehab_priority, soleo_load, priming_ok)
values
-- ---------- 1. POTENCIA Y PLIOMETRÍA ----------
('box_jump', 'Salto al Cajón', 'potencia', '["cuadriceps","gluteos","gemelos"]', 'reps', 4, '5', 'explosivo', 90,
 'Aterrizaje suave con caderas atrás. Bajar caminando del cajón, nunca saltando.', '["Aterrizar con rodillas alineadas"]', 'normal', true, true),
('box_jump_sentado', 'Box Jump desde Sentado', 'potencia', '["cuadriceps","gluteos","gemelos"]', 'reps', 4, '4', 'explosivo', 90,
 'Arranque desde inercia cero. Explosión pura de cadera sin contramovimiento.', '[]', 'normal', true, true),
('step_up_jump', 'Step-Up Jump (Pique a 1 Pie)', 'potencia', '["cuadriceps","gluteos","gemelos"]', 'reps', 3, '5 c/pierna', 'explosivo', 90,
 'Subida explosiva al cajón. Simula el pique del primer paso.', '[]', 'normal', true, true),
('skater_jump', 'Saltos de Patinador (Fluidos)', 'potencia', '["gluteos","abductores","gemelos"]', 'reps', 3, '8 c/lado', 'fluido', 60,
 'Encadenados con ritmo. Cambios de dirección laterales.', '[]', 'normal', true, true),
('skater_jump_freno', 'Saltos de Patinador (Congelado 2s)', 'potencia', '["gluteos","abductores","gemelos"]', 'reps', 3, '6 c/lado', 'freno 2s', 75,
 'Aterrizar y congelar 2 segundos. Entrena los frenos y la estabilidad tobillo-rodilla.', '[]', 'normal', true, true),
('drop_jump_broad', 'Drop Jump a Salto de Longitud', 'potencia', '["cuadriceps","gluteos","gemelos"]', 'reps', 3, '4', 'explosivo', 120,
 'Caída de cajón bajo y explosión horizontal inmediata, sin pausa en el contacto.', '["Cajón bajo (30-40cm) para proteger tendones"]', 'normal', true, true),
('broad_jump', 'Broad Jumps Encadenados', 'potencia', '["cuadriceps","gluteos","gemelos"]', 'reps', 3, '4', 'explosivo', 120,
 'Saltos de longitud encadenados sin pausa entre repeticiones.', '[]', 'normal', true, true),
('db_snatch', 'Arranque con Mancuerna', 'potencia', '["gluteos","isquiotibiales","deltoides","core"]', 'reps', 4, '5 c/brazo', 'explosivo', 90,
 'Potencia olímpica de cadera. La mancuerna sube pegada al cuerpo, la cadera hace el trabajo.', '["No tirar con el brazo, es extensión de cadera"]', 'normal', false, true),
('escalera_repiqueteo', 'Escalera: Repiqueteo', 'potencia', '["gemelos","cuadriceps"]', 'seconds', 3, '20s', 'máx frecuencia', 45,
 'Pies rápidos, contactos mínimos. Chispa neuronal pura.', '[]', 'normal', true, true),
('escalera_icky', 'Escalera: Icky Shuffle', 'potencia', '["gemelos","cuadriceps"]', 'seconds', 3, '20s', 'coordinación', 45,
 'Adentro-adentro-afuera-afuera. Coordinación y ritmo de pies.', '[]', 'normal', true, true),

-- ---------- 2. FUERZA DE PIERNAS ----------
('prensa_apoyo_alto', 'Prensa de Piernas (Apoyo Alto)', 'piernas', '["gluteos","isquiotibiales","cuadriceps"]', 'reps', 4, '8-10', '3-1-1', 90,
 'Apoyo alto en la plataforma para aislar glúteo e isquio. Control excéntrico de 3s.', '["Evitar valgo de rodilla","Lumbar neutra contra el respaldo"]', 'alta', false, false),
('hip_thrust', 'Hip Thrust', 'piernas', '["gluteos","isquiotibiales","core"]', 'reps', 4, '6-8', '2-1-2', 120,
 'El rey del primer paso del sprint. Core activo antes de empujar. Protege la pubis.', '["No hiperlordosis lumbar","Empuje con talones"]', 'alta', false, false),
('bulgara', 'Sentadilla Búlgara', 'piernas', '["cuadriceps","gluteos"]', 'reps', 3, '8 c/pierna', '2-1-1', 90,
 'Fuerza asimétrica y estabilidad unilateral. Torso levemente inclinado adelante para glúteo.', '["Rodilla alineada con el pie"]', 'alta', false, false),
('cossack', 'Estocada Lateral (Cossack Squat)', 'piernas', '["aductores","gluteos","cuadriceps"]', 'reps', 3, '8 c/lado', 'controlado', 75,
 'Apertura de cadera y frenos laterales. Clave para cambios de dirección.', '["Progresar profundidad de a poco"]', 'alta', false, false),
('rdl_mancuernas', 'Peso Muerto Rumano (Mancuernas)', 'piernas', '["isquiotibiales","gluteos","lumbar"]', 'reps', 3, '10-12', '3-1-2', 90,
 'Estiramiento y fuerza de isquios. Cadera atrás, espalda plana siempre.', '["Espalda plana estricta","No redondear lumbar"]', 'alta', false, false),
('rdl_talones', 'RDL en Talones — Variante Bypass', 'piernas', '["isquiotibiales","gluteos"]', 'reps', 3, '10-12', '3-1-2', 90,
 'BYPASS: apoyar solo el talón. Elimina la tensión en sóleo por completo.', '["Solo talones en contacto","Sin puntillas bajo ningún concepto"]', 'alta', false, false),
('hip_thrust_talon', 'Hip Thrust Talón Elevado — Variante Bypass', 'piernas', '["gluteos","core"]', 'reps', 4, '8-10', '2-1-2', 90,
 'BYPASS: plato bajo el talón para elevar la punta. Descarga total de sóleo.', '["Punta del pie libre","Evitar flexión plantar"]', 'alta', false, false),

-- ---------- 3. ARMADURA FRONTAL Y HOMBROS ----------
('press_inclinado', 'Press Inclinado con Mancuernas', 'empuje', '["pectoral","deltoides","triceps"]', 'reps', 4, '8-10', '2-1-1', 90,
 'Empuje base del torso. Escápulas retraídas contra el banco.', '[]', 'normal', false, false),
('press_inclinado_pausa', 'Press Inclinado con Pausa 2s', 'empuje', '["pectoral","deltoides","triceps"]', 'reps', 3, '6-8', 'pausa 2s', 105,
 'Pausa de 2s abajo. Mata el rebote: fuerza desde cero.', '[]', 'normal', false, false),
('floor_press', 'Floor Press con Mancuernas', 'empuje', '["pectoral","triceps"]', 'reps', 3, '8-10', '2-1-1', 90,
 'Empuje desde el piso. Rango parcial con protección lumbar total.', '[]', 'normal', false, false),
('press_militar', 'Press Militar Sentado (Mancuernas)', 'empuje', '["deltoides","triceps"]', 'reps', 4, '8-10', '2-1-1', 90,
 'Fuerza vertical. Core activo, sin arquear la espalda baja.', '["No hiperextender lumbar"]', 'normal', false, false),
('press_arnold', 'Press Arnold Sentado', 'empuje', '["deltoides"]', 'reps', 3, '10-12', 'controlado', 75,
 'Expansión y rotación completa del hombro en cada repetición.', '[]', 'normal', false, false),
('elevaciones_laterales', 'Elevaciones Laterales', 'empuje', '["deltoides"]', 'reps', 3, '12-15', '2-0-2', 60,
 'Anchura visual. Codos suaves, subir hasta la línea del hombro.', '[]', 'normal', false, false),
('flexiones_explosivas', 'Flexiones Explosivas', 'empuje', '["pectoral","triceps","core"]', 'reps', 3, '6-8', 'explosivo', 90,
 'Pliometría de torso. Despegar las manos del piso en cada rep.', '[]', 'normal', false, true),
('landmine_press', 'Landmine Press a 1 Brazo', 'empuje', '["deltoides","pectoral","oblicuos","core"]', 'reps', 3, '8 c/brazo', '2-0-1', 75,
 'Empuje diagonal con barra anclada. Transferencia directa al gesto de protección de balón.', '[]', 'normal', false, false),

-- ---------- 4. ESPALDA DE CEO ----------
('remo_mancuerna', 'Remo con Mancuerna (Apoyado en Banco)', 'traccion', '["dorsales","romboides","biceps"]', 'reps', 4, '8-10', '2-1-2', 90,
 'Tracción pura sin carga lumbar. Llevar el codo a la cadera.', '[]', 'normal', false, false),
('remo_barra_t', 'Remo Barra T (Apoyo al Pecho)', 'traccion', '["dorsales","trapecio","romboides"]', 'reps', 4, '8-10', '2-1-2', 90,
 'Densidad de espalda con el pecho apoyado: cero trampa.', '[]', 'normal', false, false),
('remo_pendlay', 'Remo Pendlay', 'traccion', '["dorsales","trapecio","lumbar"]', 'reps', 4, '6-8', 'explosivo', 105,
 'Tirón explosivo desde el piso. Cada rep arranca de cero, espalda plana estricta.', '["Espalda plana obligatoria","Reset completo en el piso entre reps"]', 'normal', false, false),
('gorilla_row', 'Gorilla Row', 'traccion', '["dorsales","core","biceps"]', 'reps', 3, '8 c/brazo', 'alternado', 75,
 'Fuerza alternada desde el piso con bisagra de cadera mantenida.', '[]', 'normal', false, false),
('renegade_row', 'Renegade Row', 'traccion', '["dorsales","core","oblicuos"]', 'reps', 3, '6 c/brazo', 'controlado', 90,
 'Remo en plancha. Anti-rotación bajo tracción: cadera inmóvil.', '["Cadera fija, no rotar la pelvis"]', 'normal', false, false),
('jalon_pecho', 'Jalón al Pecho (Polea Alta)', 'traccion', '["dorsales","biceps"]', 'reps', 4, '10-12', '2-1-2', 75,
 'Amplitud dorsal. Llevar la barra al pecho, no detrás de la nuca.', '[]', 'normal', false, false),
('dominadas', 'Dominadas', 'traccion', '["dorsales","biceps","core"]', 'reps', 4, 'máx', 'controlado', 120,
 'Fuerza con peso corporal. Rango completo: colgado total a mentón sobre barra.', '[]', 'normal', false, false),

-- ---------- 5. BOMBEO ESTÉTICO ----------
('curl_biceps', 'Curl de Bíceps', 'brazos', '["biceps"]', 'reps', 3, '10-12', '2-0-2', 60,
 'Clásico. Codos pegados al cuerpo, sin balanceo.', '[]', 'normal', false, false),
('curl_martillo', 'Curl Martillo', 'brazos', '["biceps","antebrazos"]', 'reps', 3, '10-12', '2-0-2', 60,
 'Agarre neutro. Suma braquial y antebrazo.', '[]', 'normal', false, false),
('triceps_polea', 'Tríceps en Polea', 'brazos', '["triceps"]', 'reps', 3, '12-15', '2-0-2', 60,
 'Extensión completa abajo, codos fijos.', '[]', 'normal', false, false),
('fondos', 'Fondos en Paralelas', 'brazos', '["triceps","pectoral","deltoides"]', 'reps', 3, '8-12', 'controlado', 90,
 'Alternativa: flexiones diamante. Torso vertical para más tríceps.', '["Bajar solo hasta 90° si molesta el hombro"]', 'normal', false, false),

-- ---------- 6. CORE Y PREVENCIÓN ----------
('copenhagen_plank', 'Copenhagen Plank', 'core', '["aductores","core","oblicuos"]', 'seconds', 3, '20-30s', 'isométrico', 60,
 'EL seguro anti-pubalgia. Progresión: rodilla apoyada → pie apoyado.', '["Detener si hay dolor inguinal","Pelvis neutra siempre"]', 'critica', false, false),
('copenhagen_rodilla', 'Copenhagen Plank (Rodilla) — Variante Bypass', 'core', '["aductores","core"]', 'seconds', 3, '20s', 'isométrico', 60,
 'BYPASS: versión con rodilla apoyada. Sin carga en tobillo-sóleo.', '["Rodilla apoyada, no el pie"]', 'critica', false, false),
('dead_bug', 'Dead Bug', 'core', '["core","transverso"]', 'reps', 3, '10 c/lado', 'lento', 60,
 'Estabilidad pélvica. Lumbar pegada al piso durante todo el movimiento.', '["Si la lumbar se despega, acortar palanca"]', 'alta', false, false),
('pallof_dinamico', 'Pallof Press Dinámico', 'core', '["core","oblicuos"]', 'reps', 3, '12 c/lado', '2-2-2', 60,
 'Freno rotacional en polea. Esencial para el gesto del enganche.', '["No rotar el tronco","Respiración diafragmática"]', 'critica', false, true),
('balon_rotacional', 'Balón Medicinal: Rotacional a Pared', 'core', '["oblicuos","core"]', 'reps', 3, '8 c/lado', 'explosivo', 75,
 'Potencia rotacional. El gesto del pase y el remate nace acá.', '[]', 'normal', false, true),
('balon_slam', 'Balón Medicinal: Slam al Piso', 'core', '["core","dorsales"]', 'reps', 3, '10', 'explosivo', 75,
 'Extensión-flexión violenta. Descarga total.', '[]', 'normal', false, true),
('balon_slam_rodillas', 'Balón Medicinal: Slam de Rodillas', 'core', '["core","dorsales"]', 'reps', 3, '8', 'explosivo', 75,
 'Sin piernas: aísla el core en la aceleración del balón.', '[]', 'normal', false, true),
('plancha_frontal', 'Plancha Abdominal Frontal', 'core', '["core","transverso"]', 'seconds', 3, '30-45s', 'isométrico', 60,
 'Línea recta hombro-cadera-tobillo. Glúteos y abdomen apretados.', '[]', 'normal', false, false),
('farmer_walk', 'Caminata de Granjero (Bilateral)', 'core', '["antebrazos","trapecio","core"]', 'seconds', 3, '30s', 'caminata', 90,
 'Dos pesas. Postura de CEO: hombros atrás, pasos cortos.', '[]', 'normal', false, false),
('suitcase_carry', 'Suitcase Carry (1 Pesa)', 'core', '["oblicuos","core","antebrazos"]', 'seconds', 3, '30s c/lado', 'caminata', 90,
 'Anti-flexión lateral. El core lucha para no inclinarse: blindaje puro.', '["No inclinar el torso hacia la pesa"]', 'normal', false, false),

-- ---------- 7. VO2 MAX ----------
('bici_sprints', 'Bici: Sprints 30s', 'vo2max', '["cardio","cuadriceps"]', 'seconds', 6, '30s', 'a muerte', 90,
 'Sprints máximos. Expansión de motor cardíaco sin impacto articular.', '[]', 'normal', false, false),
('bici_flush', 'Bici: Flush Metabólico (15 min)', 'vo2max', '["cardio"]', 'seconds', 1, '15 min', 'Z1 suave', 0,
 'Lavado metabólico. Post-partido, día de recuperación o mitigación de fallo de dieta.', '[]', 'normal', false, false),
('kb_swing', 'Kettlebell Swing', 'vo2max', '["gluteos","isquiotibiales","cardio","core"]', 'reps', 4, '15', 'balístico', 60,
 'Cardio de cadera. Es una bisagra explosiva, no una sentadilla.', '["La fuerza nace de la cadera, no de los brazos"]', 'normal', false, false),
('mountain_climbers', 'Mountain Climbers', 'vo2max', '["core","cardio"]', 'seconds', 3, '30s', 'rápido', 45,
 'Escaladores rápidos. Core fijo, piernas a máxima frecuencia.', '[]', 'normal', true, false),
('battle_ropes', 'Battle Ropes', 'vo2max', '["deltoides","core","cardio"]', 'seconds', 4, '30s', 'máx intensidad', 60,
 'Sogas de batalla. Potencia de hombros + motor cardíaco.', '[]', 'normal', false, false),

-- ---------- 8. DESCOMPRESIÓN Y MANTENIMIENTO ----------
('hsr_talon', 'Elevación de Talón Lenta (HSR)', 'descompresion', '["soleo","gemelos"]', 'reps', 3, '12', '3-2-3', 60,
 'Parche para tendón de Aquiles y fascia plantar. Lento, pesado, controlado.', '["Si hay dolor agudo, suspender y reportar"]', 'alta', true, false),
('caballero_psoas', 'El Caballero (Estiramiento Psoas)', 'descompresion', '["psoas"]', 'seconds', 2, '40s c/lado', 'estático', 30,
 'Liberación de cadera. Glúteo apretado del lado que estira para profundizar.', '[]', 'normal', false, false),
('dead_hang', 'Dead Hang', 'descompresion', '["dorsales","antebrazos","lumbar"]', 'seconds', 3, '30s', 'colgado', 60,
 'Descompresión lumbar y de hombros. Soltar el peso por completo.', '[]', 'normal', false, false),
('movilidad_9090', 'Movilidad de Cadera 90/90', 'descompresion', '["gluteos","psoas"]', 'seconds', 2, '45s c/lado', 'fluido', 30,
 'Rotación interna y externa de cadera. Mecánica fina anti "modo duro".', '[]', 'normal', false, false),
('libro_abierto', 'Rotación Torácica (Libro Abierto)', 'descompresion', '["dorsales","oblicuos"]', 'reps', 2, '10 c/lado', 'lento', 30,
 'Movilidad torácica en el suelo. Seguir la mano con la mirada.', '[]', 'normal', false, false)
on conflict (slug) do nothing;
