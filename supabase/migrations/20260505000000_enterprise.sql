-- Companies
create table if not exists enterprise_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null unique,  -- e.g. "acme.com"
  created_at timestamptz default now()
);

-- Users (linked to Supabase auth.users)
create table if not exists enterprise_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,  -- references auth.users.id
  company_id uuid not null references enterprise_companies(id),
  email text not null,
  full_name text,
  role text not null check (role in ('builder', 'admin')),
  created_at timestamptz default now()
);

-- Data sources (registered by IT admins)
create table if not exists enterprise_data_sources (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references enterprise_companies(id),
  name text not null,
  type text not null check (type in ('postgres', 'rest_api', 'none')),
  config_encrypted jsonb default '{}',  -- in production: encrypt credentials
  description text,
  created_by uuid references enterprise_users(id),
  created_at timestamptz default now()
);

-- App submissions (the approval workflow)
create table if not exists enterprise_submissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references enterprise_companies(id),
  builder_id uuid not null references enterprise_users(id),
  app_name text not null,
  app_description text,
  app_map_json jsonb not null,
  data_contract_json jsonb default '[]',  -- auto-generated list of data connections
  status text not null default 'draft' check (status in ('draft', 'pending', 'approved', 'rejected', 'live')),
  reviewed_by uuid references enterprise_users(id),
  review_note text,
  live_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  reviewed_at timestamptz
);

-- Audit log
create table if not exists enterprise_audit_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references enterprise_companies(id),
  submission_id uuid references enterprise_submissions(id),
  user_id uuid references enterprise_users(id),
  action text not null,  -- 'submitted', 'approved', 'rejected', 'deployed', 'viewed'
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
