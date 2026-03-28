import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('runtime_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return NextResponse.json({ logs: data });
  } catch (err) {
    return NextResponse.json({ error: String(err), logs: [] }, { status: 500 });
  }
}
