-- ============================================================
-- ENGANCHE_OS — FASE 8: Planes de rutina semanales dinámicos
-- Ejecutar en Supabase SQL Editor.
-- ============================================================

create table if not exists routine_plans (
  id uuid primary key default gen_random_uuid(),
  source_text text not null,
  explicacion text,
  days jsonb not null default '[]'::jsonb,
  -- days: [{ "day": "lunes"|...|null, "objetivo": "string", "exercises": [{exercise_id, sets, reps}] }]
  active boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists idx_routine_plans_active on routine_plans(active);

alter table routine_plans disable row level security;
