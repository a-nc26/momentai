import { NextRequest, NextResponse } from 'next/server';
import { validateRuntimeIdentity } from '@/lib/runtime-backend';
import { getSupabaseBuilder } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const appId = req.nextUrl.searchParams.get('appId');
  const token = req.nextUrl.searchParams.get('token');

  if (!appId || !token) {
    return NextResponse.json({ error: 'Missing appId or token' }, { status: 400 });
  }

  try {
    await validateRuntimeIdentity({ appId, publishToken: token });

    const { data, error } = await getSupabaseBuilder()
      .from('app_records')
      .select('guest_id, created_at')
      .eq('app_id', appId);

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as { guest_id: string; created_at?: string }[];
    const guestCount = new Set(rows.map((r) => r.guest_id)).size;
    const recordCount = rows.length;
    const lastActivity = rows
      .map((r) => r.created_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

    return NextResponse.json({ guestCount, recordCount, lastActivity });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}
