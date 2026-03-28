import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { level = 'debug', tag, message, data } = await req.json();

  const prefix = `[${tag ?? 'client'}]`;
  const formatted = data !== undefined
    ? `${prefix} ${message} ${JSON.stringify(data, null, 2)}`
    : `${prefix} ${message}`;

  if (level === 'error') {
    console.error(formatted);
  } else if (level === 'warn') {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }

  // Persist warn + error to Supabase so they're queryable
  if (level === 'warn' || level === 'error') {
    try {
      await getSupabase()
        .from('runtime_logs')
        .insert({ level, tag: tag ?? null, message, data: data ?? null });
    } catch {
      // Never let logging break the app
    }
  }

  return NextResponse.json({ ok: true });
}
