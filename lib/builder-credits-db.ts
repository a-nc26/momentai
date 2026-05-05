import { getSupabaseBuilder, isBuilderSupabaseConfigured } from '@/lib/supabase';
import { randomBytes } from 'crypto';

const CODE_PREFIX = 'MNT-';

/** User-facing: fold unicode hyphens, strip spaces, ensure MNT-… shape for our minted codes. */
function normalizeCode(plain: string): string {
  let s = plain
    .trim()
    .toUpperCase()
    // Unicode/Windows “hyphens” to ASCII (common paste issue)
    .replace(/[\u2010-\u2015\u2212\ufe58\ufe63\uff0d]/g, '-');
  // Remove spaces (avoids "MNT-  ABC" → "MNT--ABC" with the old \s → '-' rule)
  s = s.replace(/\s+/g, '');
  // MNTXXXXXXXX → MNT-XXXXXXXX (our codes are MNT- + suffix)
  if (s.startsWith('MNT') && (s.length < 4 || s[3] !== '-')) {
    s = `MNT-${s.slice(3)}`;
  }
  s = s.replace(/^MNT-+-/, 'MNT-');
  return s;
}

function generateCode(): string {
  const n = randomBytes(5).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  return `${CODE_PREFIX}${n}`;
}

export type BuilderCodeRow = {
  id: string;
  code: string;
  label: string | null;
  credits_per_redeem: number;
  max_redemptions: number;
  redemption_count: number;
  expires_at: string | null;
  revoked: boolean;
  created_at: string;
};

export type RedeemResult =
  | { ok: true; sessionId: string; credits: number; label: string | null }
  | {
      ok: false;
      error:
        | 'not_found'
        | 'maxed'
        | 'expired'
        | 'revoked'
        | 'config'
        | 'schema_missing'
        | 'session_failed';
    };

function isMissingBuilderTableError(err: { message?: string; code?: string }): boolean {
  const m = (err.message ?? '').toLowerCase();
  const c = err.code ?? '';
  return (
    c === 'PGRST205' ||
    m.includes('builder_codes') ||
    m.includes('schema cache') ||
    m.includes('does not exist') ||
    m.includes('relation') && m.includes('not exist')
  );
}

export async function redeemBuilderCode(plain: string): Promise<RedeemResult> {
  if (!isBuilderSupabaseConfigured()) {
    return { ok: false, error: 'config' };
  }
  const supabase = getSupabaseBuilder();
  const code = normalizeCode(plain);
  if (code.length < 4) {
    return { ok: false, error: 'not_found' };
  }

  const { data: row, error: fetchErr } = await supabase
    .from('builder_codes')
    .select('id, label, credits_per_redeem, max_redemptions, redemption_count, expires_at, revoked')
    .eq('code', code)
    .maybeSingle();

  if (fetchErr) {
    console.error('[redeemBuilderCode] load code', {
      inviteCode: code,
      message: fetchErr.message,
      code: fetchErr.code,
    });
    if (isMissingBuilderTableError(fetchErr)) {
      return { ok: false, error: 'schema_missing' };
    }
    return { ok: false, error: 'config' };
  }
  if (!row) {
    return { ok: false, error: 'not_found' };
  }
  if (row.revoked) {
    return { ok: false, error: 'revoked' };
  }
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { ok: false, error: 'expired' };
  }
  if (row.redemption_count >= row.max_redemptions) {
    return { ok: false, error: 'maxed' };
  }

  const credits = row.credits_per_redeem as number;
  const { data: ins, error: insErr } = await supabase
    .from('builder_sessions')
    .insert({ code_id: row.id, credits_remaining: credits })
    .select('id')
    .single();

  if (insErr || !ins?.id) {
    console.error('[redeemBuilderCode] insert session', insErr);
    return { ok: false, error: 'session_failed' };
  }

  const { error: upErr } = await supabase
    .from('builder_codes')
    .update({ redemption_count: (row.redemption_count as number) + 1 })
    .eq('id', row.id)
    .eq('redemption_count', row.redemption_count);

  if (upErr) {
    // Race: max redemptions — delete orphan session
    await supabase.from('builder_sessions').delete().eq('id', ins.id);
    return { ok: false, error: 'maxed' };
  }

  return {
    ok: true,
    sessionId: ins.id,
    credits,
    label: (row.label as string | null) ?? null,
  };
}

export async function getSessionCredits(sessionId: string): Promise<number | null> {
  if (!isBuilderSupabaseConfigured()) return null;
  const supabase = getSupabaseBuilder();
  const { data, error } = await supabase
    .from('builder_sessions')
    .select('credits_remaining')
    .eq('id', sessionId)
    .maybeSingle();
  if (error || !data) return null;
  return data.credits_remaining as number;
}

export async function deductBuilderSessionCredits(
  sessionId: string,
  amount: number
): Promise<{ ok: true; remaining: number } | { ok: false; reason: 'insufficient' | 'missing' }> {
  if (amount <= 0) {
    const r = await getSessionCredits(sessionId);
    if (r == null) return { ok: false, reason: 'missing' };
    return { ok: true, remaining: r };
  }
  if (!isBuilderSupabaseConfigured()) {
    return { ok: false, reason: 'missing' };
  }
  const supabase = getSupabaseBuilder();
  const { data, error } = await supabase.rpc('deduct_builder_credits', {
    p_session_id: sessionId,
    p_amount: amount,
  });
  if (error) {
    console.error('[deduct] rpc', error);
    return { ok: false, reason: 'missing' };
  }
  if (data === -1 || data == null) {
    return { ok: false, reason: 'insufficient' };
  }
  return { ok: true, remaining: data as number };
}

export async function listBuilderCodes(): Promise<BuilderCodeRow[]> {
  const supabase = getSupabaseBuilder();
  const { data, error } = await supabase
    .from('builder_codes')
    .select(
      'id, code, label, credits_per_redeem, max_redemptions, redemption_count, expires_at, revoked, created_at'
    )
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[listBuilderCodes]', error);
    return [];
  }
  return (data ?? []) as BuilderCodeRow[];
}

export async function adminCreateBuilderCode(input: {
  label?: string;
  credits: number;
  maxRedemptions: number;
  expiresInDays: number | null;
}): Promise<{ code: string; id: string }> {
  const supabase = getSupabaseBuilder();
  const plain = generateCode();
  const expiresAt =
    input.expiresInDays != null && input.expiresInDays > 0
      ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const { data, error } = await supabase
    .from('builder_codes')
    .insert({
      code: plain,
      label: input.label ?? null,
      credits_per_redeem: input.credits,
      max_redemptions: input.maxRedemptions,
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? 'Failed to create code');
  }
  return { code: plain, id: data.id as string };
}

export async function adminRevokeCode(id: string): Promise<void> {
  const supabase = getSupabaseBuilder();
  const { error } = await supabase.from('builder_codes').update({ revoked: true }).eq('id', id);
  if (error) throw new Error(error.message);
}
