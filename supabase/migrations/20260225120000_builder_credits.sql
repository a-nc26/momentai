-- Builder: admin-minted redeem codes → sessions with a credit balance (deducted on API use).

create table if not exists public.builder_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text,
  credits_per_redeem int not null check (credits_per_redeem > 0),
  max_redemptions int not null default 1 check (max_redemptions > 0),
  redemption_count int not null default 0,
  expires_at timestamptz,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.builder_sessions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid references public.builder_codes (id) on delete set null,
  credits_remaining int not null check (credits_remaining >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_builder_sessions_created on public.builder_sessions (created_at);

-- Returns new balance, or -1 if insufficient / session not found
create or replace function public.deduct_builder_credits (p_session_id uuid, p_amount int)
returns int
language plpgsql
as $$
declare
  v_new int;
begin
  if p_amount <= 0 then
    select credits_remaining into v_new
    from public.builder_sessions
    where id = p_session_id;
    return coalesce(v_new, -1);
  end if;

  update public.builder_sessions
  set credits_remaining = credits_remaining - p_amount
  where id = p_session_id
    and credits_remaining >= p_amount
  returning credits_remaining into v_new;

  if v_new is null then
    return -1;
  end if;
  return v_new;
end;
$$;
