import { NextRequest, NextResponse } from 'next/server';
import { validateRuntimeIdentity } from '@/lib/runtime-backend';
import { getSupabaseBuilder } from '@/lib/supabase';

export interface AppRecord {
  guest_id: string;
  namespace: string;
  key: string;
  value_json: unknown;
  created_at?: string;
  updated_at?: string;
}

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
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw new Error(error.message);

    return NextResponse.json({ records: (data ?? []) as AppRecord[] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}
