import { NextRequest } from 'next/server';
import { requireEnterpriseUser } from '@/lib/enterprise/auth';
import { getSupabase } from '@/lib/supabase';
import type { DataContractEntry } from '@/lib/enterprise/types';
import type { AppMap } from '@/lib/types';

// GET /api/enterprise/submissions
// Admins see all submissions for company; builders see only their own
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireEnterpriseUser(req);
  } catch (res) {
    return res as Response;
  }

  const supabase = getSupabase();
  let query = supabase
    .from('enterprise_submissions')
    .select('*, builder:enterprise_users!builder_id(*)')
    .eq('company_id', user.company_id)
    .order('created_at', { ascending: false });

  if (user.role === 'builder') {
    query = query.eq('builder_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ submissions: data });
}

// POST /api/enterprise/submissions
// Body: { appName, appDescription, appMapJson, dataContractJson }
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireEnterpriseUser(req);
  } catch (res) {
    return res as Response;
  }

  const body = await req.json();
  const { appName, appDescription, appMapJson, dataContractJson } = body as {
    appName: string;
    appDescription?: string;
    appMapJson: AppMap;
    dataContractJson?: DataContractEntry[];
  };

  if (!appName || !appMapJson) {
    return Response.json({ error: 'appName and appMapJson are required' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('enterprise_submissions')
    .insert({
      company_id: user.company_id,
      builder_id: user.id,
      app_name: appName,
      app_description: appDescription ?? null,
      app_map_json: appMapJson,
      data_contract_json: dataContractJson ?? [],
      status: 'draft',
    })
    .select()
    .single();

  if (error || !data) {
    return Response.json({ error: error?.message ?? 'Failed to create submission' }, { status: 500 });
  }

  return Response.json({ submission: data }, { status: 201 });
}
