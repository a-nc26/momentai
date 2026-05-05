create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null,
  status text not null default 'ok',
  route text null,
  model text null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer generated always as (input_tokens + output_tokens) stored,
  cost_usd_estimate numeric(12, 6) not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists usage_events_created_at_idx
  on public.usage_events (created_at desc);

create index if not exists usage_events_event_type_idx
  on public.usage_events (event_type);
