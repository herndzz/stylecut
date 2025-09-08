-- StyleCut - Schema PostgreSQL (MVP)
-- Como executar (ajuste usuário/porta conforme seu ambiente):
-- 1) Criar o banco (se ainda não existir):
--    psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE stylecut_db;"
-- 2) Rodar este script no banco:
--    psql -U postgres -h localhost -p 5432 -d stylecut_db -f database/init.sql

BEGIN;

-- Extensão para UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: clients
CREATE TABLE IF NOT EXISTS public.clients (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  email       text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clients_phone_uniq UNIQUE (phone)
);

-- Tabela: professionals
CREATE TABLE IF NOT EXISTS public.professionals (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  email       text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT professionals_phone_uniq UNIQUE (phone)
);

-- Tabela: services
CREATE TABLE IF NOT EXISTS public.services (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              text NOT NULL,
  duration_minutes  integer NOT NULL CHECK (duration_minutes > 0),
  price_cents       integer NOT NULL CHECK (price_cents >= 0),
  description       text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Tabela: appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  status           text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  start_time       timestamptz NOT NULL,
  client_id        uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  professional_id  uuid NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  service_id       uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointments_professional_time_uniq UNIQUE (professional_id, start_time)
);

-- Índices auxiliares (opcionais, úteis para listagens por data e relacionamentos)
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments (start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON public.appointments (client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional ON public.appointments (professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON public.appointments (service_id);

COMMIT;
