-- ============================================================
-- ENGANCHE_OS — FASE 6/7: Entrenador IA + Telemetría Biomédica
-- Ejecutar en Supabase SQL Editor.
-- ============================================================

create table if not exists ailments (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  muscles_affected jsonb not null default '[]'::jsonb,
  excluded_exercise_ids jsonb not null default '[]'::jsonb,  -- ids de exercises vetados
  alternatives jsonb not null default '[]'::jsonb,           -- [{exercise_id, name, motivo}]
  active boolean not null default true,
  reported_at timestamptz default now(),
  resolved_at timestamptz
);

create index if not exists idx_ailments_active on ailments(active);

alter table ailments disable row level security;
