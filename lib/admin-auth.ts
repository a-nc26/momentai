import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin for /api/admin/* — set either (or both):
 * - MOMENTAI_ADMIN_PIN=6379  → send header X-Admin-Pin: 6379
 * - MOMENTAI_ADMIN_SECRET=…  → send Authorization: Bearer <secret> (optional legacy, scripts/CI)
 */

/**
 * @returns null if allowed, or a JSON NextResponse (401/501)
 */
export function requireAdminApi(req: NextRequest): NextResponse | null {
  const pin = process.env.MOMENTAI_ADMIN_PIN?.trim();
  const secret = process.env.MOMENTAI_ADMIN_SECRET?.trim();
  if (!pin && !secret) {
    return NextResponse.json(
      {
        error: 'Admin is not configured. Set MOMENTAI_ADMIN_PIN (4-digit) in server env.',
        code: 'ADMIN_NOT_CONFIGURED',
      },
      { status: 501 }
    );
  }
  const headerPin = req.headers.get('x-admin-pin')?.trim() ?? '';
  if (pin && headerPin === pin) {
    return null;
  }
  const auth = req.headers.get('authorization');
  if (secret && auth === `Bearer ${secret}`) {
    return null;
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
