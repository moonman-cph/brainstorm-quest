-- BrainStorm Quest — Supabase table setup
-- Run this in: Supabase dashboard → SQL Editor → New query → Run
--
-- After running, also go to:
--   Table Editor → sessions → Realtime → Enable
--   Table Editor → responses → Realtime → Enable
-- (Needed for the tavern waiting room to update live)

-- Sessions table
create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  anonymous   boolean not null default true,
  status      text not null default 'open',   -- 'open' | 'synthesizing' | 'done'
  result_json jsonb,
  created_at  timestamptz not null default now()
);

-- Responses table
create table if not exists responses (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references sessions(id) on delete cascade,
  slot         text not null,
  class        text not null,
  answers      jsonb not null default '{}',
  submitted_at timestamptz not null default now()
);

-- Index for fast lookups
create index if not exists responses_session_idx on responses(session_id);
create index if not exists sessions_code_idx     on sessions(code);

-- Disable RLS for prototype (re-enable and add policies before going public)
alter table sessions  disable row level security;
alter table responses disable row level security;
