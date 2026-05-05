import { NextRequest, NextResponse } from 'next/server';
import { isBuilderSupabaseConfigured } from '@/lib/supabase';
import {
  deductBuilderSessionCredits,
  getSessionCredits,
} from '@/lib/builder-credits-db';

/** Supabase builder session (UUID in HttpOnly cookie). */
export const BUILDER_SESSION_COOKIE = 'mb_sess';

/**
 * Legacy: single env access code, cookie `momentai_build=1` (used when Supabase is not configured).
 */
export const LEGACY_BUILD_ACCESS_COOKIE = 'momentai_build';

/**
 * @deprecated use env in DB mode — kept for MOMENTAI_BUILD_CODE when Supabase is off.
 */
export function getExpectedBuildCode(): string {
  return (process.env.MOMENTAI_BUILD_CODE ?? 'Itsamoment').trim();
}

/** If `MOMENTAI_SKIP_BUILD_ACCESS=1`, all checks pass (local dev only). */
export function isBuildAccessSkipped(): boolean {
  return process.env.MOMENTAI_SKIP_BUILD_ACCESS === '1';
}

function hasLegacyBuildCookie(req: NextRequest): boolean {
  return req.cookies.get(LEGACY_BUILD_ACCESS_COOKIE)?.value === '1';
}

function buildAccessDenied(): NextResponse {
  return NextResponse.json(
    {
      error: 'Builder access required. Redeem a code on the app page, or use the interactive demo.',
      code: 'NO_BUILD_ACCESS',
    },
    { status: 403 }
  );
}

/**
 * Deducts credits for the current session (or allows legacy / skip).
 * @param cost use 0 to only require a valid session (no deduction).
 */
export async function requireBuildCredits(
  req: NextRequest,
  cost: number
): Promise<NextResponse | null> {
  if (isBuildAccessSkipped()) {
    return null;
  }
  if (isBuilderSupabaseConfigured()) {
    const sid = req.cookies.get(BUILDER_SESSION_COOKIE)?.value;
    if (!sid) {
      return buildAccessDenied();
    }
    if (cost <= 0) {
      const r = await getSessionCredits(sid);
      if (r == null) {
        return buildAccessDenied();
      }
      return null;
    }
    const d = await deductBuilderSessionCredits(sid, cost);
    if (!d.ok) {
      if (d.reason === 'insufficient') {
        return NextResponse.json(
          {
            error: 'Not enough builder credits. Redeem another code or ask an admin for more.',
            code: 'INSUFFICIENT_CREDITS',
          },
          { status: 403 }
        );
      }
      return buildAccessDenied();
    }
    return null;
  }
  if (hasLegacyBuildCookie(req)) {
    return null;
  }
  return buildAccessDenied();
}

export function codesMatch(provided: string, expected: string): boolean {
  return provided.trim().toLowerCase() === expected.trim().toLowerCase();
}
