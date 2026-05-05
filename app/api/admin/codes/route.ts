import { NextRequest, NextResponse } from 'next/server';
import { isBuilderSupabaseConfigured } from '@/lib/supabase';
import { requireAdminApi } from '@/lib/admin-auth';
import {
  adminCreateBuilderCode,
  adminRevokeCode,
  listBuilderCodes,
} from '@/lib/builder-credits-db';

/**
 * GET /api/admin/codes — list minted codes (X-Admin-Pin or Bearer MOMENTAI_ADMIN_SECRET).
 */
export async function GET(req: NextRequest) {
  const auth = requireAdminApi(req);
  if (auth) return auth;
  if (!isBuilderSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          'Builder database env not set. Add SUPABASE_BUILDER_URL + SUPABASE_BUILDER_SERVICE_ROLE_KEY, or SUPABASE_URL + service role key for a single project.',
      },
      { status: 501 }
    );
  }
  const codes = await listBuilderCodes();
  return NextResponse.json({ codes });
}

/**
 * POST /api/admin/codes — create a new redeemable code.
 * Body: { label?: string, credits: number, maxRedemptions?: number, expiresInDays?: number | null }
 */
export async function POST(req: NextRequest) {
  const auth = requireAdminApi(req);
  if (auth) return auth;
  if (!isBuilderSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          'Builder database env not set. Add SUPABASE_BUILDER_URL + SUPABASE_BUILDER_SERVICE_ROLE_KEY, or SUPABASE_URL + service role key for a single project.',
      },
      { status: 501 }
    );
  }
  let body: {
    label?: string;
    credits?: number;
    maxRedemptions?: number;
    expiresInDays?: number | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const credits = typeof body.credits === 'number' && body.credits > 0 ? body.credits : 0;
  if (!credits) {
    return NextResponse.json({ error: 'credits must be a positive number' }, { status: 400 });
  }
  const maxRedemptions =
    typeof body.maxRedemptions === 'number' && body.maxRedemptions > 0 ? body.maxRedemptions : 1;
  const expiresInDays =
    body.expiresInDays === null || body.expiresInDays === undefined
      ? null
      : typeof body.expiresInDays === 'number'
        ? body.expiresInDays
        : null;

  try {
    const created = await adminCreateBuilderCode({
      label: body.label,
      credits,
      maxRedemptions,
      expiresInDays: expiresInDays && expiresInDays > 0 ? expiresInDays : null,
    });
    return NextResponse.json({ code: created.code, id: created.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create code';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/codes?id=uuid — revoke a code.
 */
export async function DELETE(req: NextRequest) {
  const auth = requireAdminApi(req);
  if (auth) return auth;
  if (!isBuilderSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          'Builder database env not set. Add SUPABASE_BUILDER_URL + SUPABASE_BUILDER_SERVICE_ROLE_KEY, or SUPABASE_URL + service role key for a single project.',
      },
      { status: 501 }
    );
  }
  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id query required' }, { status: 400 });
  }
  try {
    await adminRevokeCode(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to revoke';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
