import { NextRequest } from 'next/server';
import { requireEnterpriseUser, requireEnterpriseAdmin } from '@/lib/enterprise/auth';
import { getSupabase } from '@/lib/supabase';

// GET /api/enterprise/data-sources
// Lists data sources for the user's company
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireEnterpriseUser(req);
  } catch (res) {
    return res as Response;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('enterprise_data_sources')
    .select('*')
    .eq('company_id', user.company_id)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ dataSources: data });
}

// POST /api/enterprise/data-sources
// Admin only. Body: { name, type, description?, config? }
export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireEnterpriseAdmin(req);
  } catch (res) {
    return res as Response;
  }

  const body = await req.json();
  const { name, type, description, config } = body as {
    name: string;
    type: 'postgres' | 'rest_api' | 'none';
    description?: string;
    config?: Record<string, unknown>;
  };

  if (!name || !type) {
    return Response.json({ error: 'name and type are required' }, { status: 400 });
  }

  if (!['postgres', 'rest_api', 'none'].includes(type)) {
    return Response.json(
      { error: 'type must be "postgres", "rest_api", or "none"' },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('enterprise_data_sources')
    .insert({
      company_id: admin.company_id,
      name,
      type,
      description: description ?? null,
      config_encrypted: config ?? {},
      created_by: admin.id,
    })
    .select()
    .single();

  if (error || !data) {
    return Response.json(
      { error: error?.message ?? 'Failed to create data source' },
      { status: 500 }
    );
  }

  return Response.json({ dataSource: data }, { status: 201 });
}
