import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _builderClient: SupabaseClient | null = null;

/**
 * Default project: `/api/session`, `/api/log` → `app_sessions`, `runtime_logs`.
 * Env: SUPABASE_URL + SUPABASE_SERVICE_KEY | SUPABASE_SERVICE_ROLE_KEY
 */
export function getSupabaseServiceRoleKey(): string | undefined {
  const k = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return k?.trim() || undefined;
}

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL?.trim();
    const key = getSupabaseServiceRoleKey();
    if (!url || !key) {
      throw new Error(
        'Missing SUPABASE_URL or service role key (set SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY)'
      );
    }
    _client = createClient(url, key);
  }
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && getSupabaseServiceRoleKey());
}

function getBuilderServiceRoleKey(): string | undefined {
  const k =
    process.env.SUPABASE_BUILDER_SERVICE_KEY ??
    process.env.SUPABASE_BUILDER_SERVICE_ROLE_KEY;
  return k?.trim() || undefined;
}

/**
 * Builder credits + invite codes only (`builder_codes`, `builder_sessions`, admin mint).
 * When SUPABASE_BUILDER_URL + builder service key are set, uses that project; otherwise
 * falls back to {@link getSupabase} so a single project still works.
 */
export function getSupabaseBuilder(): SupabaseClient {
  const url = process.env.SUPABASE_BUILDER_URL?.trim();
  const key = getBuilderServiceRoleKey();
  if (url && key) {
    if (!_builderClient) {
      _builderClient = createClient(url, key);
    }
    return _builderClient;
  }
  return getSupabase();
}

/** True if redeem/admin credits can use the DB (dedicated builder project or shared default). */
export function isBuilderSupabaseConfigured(): boolean {
  const dedicated = Boolean(
    process.env.SUPABASE_BUILDER_URL?.trim() && getBuilderServiceRoleKey()
  );
  if (dedicated) return true;
  return isSupabaseConfigured();
}
