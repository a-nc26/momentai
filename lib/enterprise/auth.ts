import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import type { EnterpriseUser, EnterpriseCompany } from './types';

/**
 * Client-side Supabase client using public anon key.
 * Safe to call in browser context.
 */
export function createEnterpriseSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // In dev without keys, return a stub client that always returns no session
  if (!url || !anonKey) {
    return createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
  }
  return createClient(url, anonKey);
}

/**
 * Server-side: look up an enterprise user by their Supabase auth.users id.
 * Returns the user with their company attached.
 */
export async function getEnterpriseUser(
  authUserId: string
): Promise<(EnterpriseUser & { company: EnterpriseCompany }) | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('enterprise_users')
    .select('*, company:enterprise_companies(*)')
    .eq('auth_user_id', authUserId)
    .single();

  if (error || !data) return null;
  return data as EnterpriseUser & { company: EnterpriseCompany };
}

/**
 * Server-side middleware helper.
 * Reads `Authorization: Bearer <token>` header, verifies with Supabase auth,
 * and returns the enterprise user.
 * Throws a Response with 401 if invalid.
 */
export async function requireEnterpriseUser(
  req: NextRequest
): Promise<EnterpriseUser & { company: EnterpriseCompany }> {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw Response.json({ error: 'Unauthorized: missing token' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw Response.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const authClient = createClient(url, anonKey);
  const { data: authData, error: authError } = await authClient.auth.getUser(token);

  if (authError || !authData.user) {
    throw Response.json({ error: 'Unauthorized: invalid token' }, { status: 401 });
  }

  const user = await getEnterpriseUser(authData.user.id);
  if (!user) {
    throw Response.json({ error: 'Unauthorized: enterprise user not found' }, { status: 401 });
  }

  return user;
}

/**
 * Same as requireEnterpriseUser but also checks role === 'admin'.
 * Throws 403 if the user is not an admin.
 */
export async function requireEnterpriseAdmin(
  req: NextRequest
): Promise<EnterpriseUser & { company: EnterpriseCompany }> {
  const user = await requireEnterpriseUser(req);
  if (user.role !== 'admin') {
    throw Response.json({ error: 'Forbidden: admin role required' }, { status: 403 });
  }
  return user;
}
