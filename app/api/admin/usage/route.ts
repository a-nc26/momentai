import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { isBuilderSupabaseConfigured, getSupabaseBuilder } from '@/lib/supabase';

type UsageEventRow = {
  id: string;
  created_at: string;
  event_type: string;
  status: string;
  route: string | null;
  model: string | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd_estimate: number;
  metadata: Record<string, unknown> | null;
};

export async function GET(req: NextRequest) {
  const auth = requireAdminApi(req);
  if (auth) return auth;
  if (!isBuilderSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          'Builder Supabase is not configured. Add SUPABASE_BUILDER_URL + SUPABASE_BUILDER_SERVICE_ROLE_KEY, or use SUPABASE_URL + service role key for a single project.',
      },
      { status: 501 }
    );
  }

  const supabase = getSupabaseBuilder();
  const { data, error } = await supabase
    .from('usage_events')
    .select(
      'id, created_at, event_type, status, route, model, input_tokens, output_tokens, total_tokens, cost_usd_estimate, metadata'
    )
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as UsageEventRow[];
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const totals = rows.reduce(
    (acc, row) => {
      const ts = new Date(row.created_at).getTime();
      const cost = Number(row.cost_usd_estimate ?? 0) || 0;
      const input = Number(row.input_tokens ?? 0) || 0;
      const output = Number(row.output_tokens ?? 0) || 0;
      const total = Number(row.total_tokens ?? input + output) || 0;
      acc.all.events += 1;
      acc.all.input_tokens += input;
      acc.all.output_tokens += output;
      acc.all.total_tokens += total;
      acc.all.cost_usd_estimate += cost;
      if (ts >= dayAgo) {
        acc.last_24h.events += 1;
        acc.last_24h.input_tokens += input;
        acc.last_24h.output_tokens += output;
        acc.last_24h.total_tokens += total;
        acc.last_24h.cost_usd_estimate += cost;
      }
      if (ts >= monthAgo) {
        acc.last_30d.events += 1;
        acc.last_30d.input_tokens += input;
        acc.last_30d.output_tokens += output;
        acc.last_30d.total_tokens += total;
        acc.last_30d.cost_usd_estimate += cost;
      }
      return acc;
    },
    {
      all: { events: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0, cost_usd_estimate: 0 },
      last_24h: {
        events: 0,
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
        cost_usd_estimate: 0,
      },
      last_30d: {
        events: 0,
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
        cost_usd_estimate: 0,
      },
    }
  );

  const byEventType = rows.reduce<Record<string, { events: number; total_tokens: number; cost: number }>>(
    (acc, row) => {
      const key = row.event_type || 'unknown';
      if (!acc[key]) acc[key] = { events: 0, total_tokens: 0, cost: 0 };
      acc[key].events += 1;
      acc[key].total_tokens += Number(row.total_tokens ?? 0) || 0;
      acc[key].cost += Number(row.cost_usd_estimate ?? 0) || 0;
      return acc;
    },
    {}
  );

  return NextResponse.json({
    totals,
    byEventType,
    events: rows,
  });
}
