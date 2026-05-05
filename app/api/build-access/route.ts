import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isBuilderSupabaseConfigured } from '@/lib/supabase';
import { redeemBuilderCode, getSessionCredits } from '@/lib/builder-credits-db';
import {
  BUILDER_SESSION_COOKIE,
  LEGACY_BUILD_ACCESS_COOKIE,
  getExpectedBuildCode,
  codesMatch,
} from '@/lib/build-access-server';

const baseCookie = {
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 90,
  secure: process.env.NODE_ENV === 'production',
};

/**
 * GET /api/build-access — session + credits, or legacy flag.
 */
export async function GET() {
  if (isBuilderSupabaseConfigured()) {
    const c = (await cookies()).get(BUILDER_SESSION_COOKIE);
    if (!c?.value) {
      return NextResponse.json({
        hasSession: false,
        credits: null,
        mode: 'credits' as const,
        canUseBuilder: false,
      });
    }
    const cr = await getSessionCredits(c.value);
    if (cr == null) {
      return NextResponse.json({
        hasSession: false,
        credits: null,
        mode: 'credits' as const,
        canUseBuilder: false,
      });
    }
    return NextResponse.json({
      hasSession: true,
      credits: cr,
      mode: 'credits' as const,
      canUseBuilder: cr > 0,
    });
  }
  const legacy = (await cookies()).get(LEGACY_BUILD_ACCESS_COOKIE);
  return NextResponse.json({
    hasSession: legacy?.value === '1',
    credits: null,
    mode: 'legacy' as const,
    canUseBuilder: legacy?.value === '1',
  });
}

/**
 * POST /api/build-access — body: { code: string }
 * Supabase: redeems a minted code. Legacy: single env code → legacy cookie.
 */
export async function POST(req: NextRequest) {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const raw = typeof body.code === 'string' ? body.code : '';
  if (!raw.trim()) {
    return NextResponse.json({ ok: false, error: 'Enter a code' }, { status: 400 });
  }

  if (isBuilderSupabaseConfigured()) {
    const r = await redeemBuilderCode(raw);
    if (!r.ok) {
      const msg: Record<typeof r.error, string> = {
        not_found: 'Invalid or unknown code',
        maxed: 'This code has already been used the maximum number of times',
        expired: 'This code has expired',
        revoked: 'This code is no longer valid',
        config:
          'Could not reach the builder Supabase project. Set SUPABASE_BUILDER_URL + SUPABASE_BUILDER_SERVICE_ROLE_KEY (or SUPABASE_BUILDER_SERVICE_KEY) for invite codes only, or use SUPABASE_URL + service role key for a single shared project. Redeploy after saving.',
        schema_missing:
          'Builder tables are missing in the builder Supabase project. In that project’s SQL Editor, run supabase/migrations/20260225120000_builder_credits.sql.',
        session_failed:
          'This code is valid, but the server could not start a session. Run the builder migration on the same Supabase project as SUPABASE_BUILDER_URL (or SUPABASE_URL if you use one project).',
      };
      return NextResponse.json(
        { ok: false, error: msg[r.error] ?? 'Could not redeem' },
        { status: 401 }
      );
    }
    const res = NextResponse.json({ ok: true, credits: r.credits, label: r.label });
    res.cookies.set(BUILDER_SESSION_COOKIE, r.sessionId, { ...baseCookie, httpOnly: true });
    res.cookies.set(LEGACY_BUILD_ACCESS_COOKIE, '', { ...baseCookie, maxAge: 0 });
    return res;
  }

  const expected = getExpectedBuildCode();
  if (!codesMatch(raw, expected)) {
    return NextResponse.json({ ok: false, error: 'Invalid access code' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, credits: null, mode: 'legacy' as const });
  res.cookies.set(LEGACY_BUILD_ACCESS_COOKIE, '1', { ...baseCookie, httpOnly: true });
  return res;
}

/**
 * DELETE /api/build-access — sign out of builder (clear cookies)
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(BUILDER_SESSION_COOKIE, '', { ...baseCookie, httpOnly: true, maxAge: 0 });
  res.cookies.set(LEGACY_BUILD_ACCESS_COOKIE, '', { ...baseCookie, httpOnly: true, maxAge: 0 });
  return res;
}
