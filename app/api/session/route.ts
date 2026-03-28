import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// GET /api/session?projectId=xxx&sessionId=yyy
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const sessionId = searchParams.get('sessionId');

  if (!projectId || !sessionId) {
    return Response.json({ error: 'projectId and sessionId required' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('app_sessions')
    .select('state')
    .eq('project_id', projectId)
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ state: data?.state ?? null });
}

// POST /api/session  { projectId, sessionId, state }
export async function POST(req: NextRequest) {
  const { projectId, sessionId, state } = await req.json();

  if (!projectId || !sessionId || !state) {
    return Response.json({ error: 'projectId, sessionId and state required' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from('app_sessions')
    .upsert(
      { project_id: projectId, session_id: sessionId, state, updated_at: new Date().toISOString() },
      { onConflict: 'project_id,session_id' },
    );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
