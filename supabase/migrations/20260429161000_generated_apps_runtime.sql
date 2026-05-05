-- Generic backend runtime for generated apps.
-- Uses app_id + publish token validation in server routes; raw tokens are never stored.

create table if not exists public.generated_apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  app_map_json jsonb not null,
  publish_token_hash text not null,
  token_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_records (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.generated_apps(id) on delete cascade,
  guest_id text not null,
  namespace text not null default 'default',
  key text not null,
  value_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_id, guest_id, namespace, key)
);

create index if not exists app_records_app_guest_idx
  on public.app_records (app_id, guest_id);

create index if not exists app_records_app_namespace_idx
  on public.app_records (app_id, namespace);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists generated_apps_updated_at on public.generated_apps;
create trigger generated_apps_updated_at
  before update on public.generated_apps
  for each row execute function public.set_updated_at();

drop trigger if exists app_records_updated_at on public.app_records;
create trigger app_records_updated_at
  before update on public.app_records
  for each row execute function public.set_updated_at();
