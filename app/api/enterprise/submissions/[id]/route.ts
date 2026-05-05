import { NextRequest } from 'next/server';
import { requireEnterpriseUser, requireEnterpriseAdmin } from '@/lib/enterprise/auth';
import { getSupabase } from '@/lib/supabase';

// GET /api/enterprise/submissions/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireEnterpriseUser(req);
  } catch (res) {
    return res as Response;
  }

  const { id } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('enterprise_submissions')
    .select('*, builder:enterprise_users!builder_id(*)')
    .eq('id', id)
    .eq('company_id', user.company_id)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Submission not found' }, { status: 404 });
  }

  // Builders can only view their own submissions
  if (user.role === 'builder' && data.builder_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  return Response.json({ submission: data });
}

// PATCH /api/enterprise/submissions/[id]
// Admin: { status: 'approved' | 'rejected', reviewNote? }
// Builder: { appMapJson?, dataContractJson?, appName?, appDescription?, status: 'pending' }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireEnterpriseUser(req);
  } catch (res) {
    return res as Response;
  }

  const { id } = await params;
  const supabase = getSupabase();

  // First fetch the submission to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('enterprise_submissions')
    .select('*')
    .eq('id', id)
    .eq('company_id', user.company_id)
    .single();

  if (fetchError || !existing) {
    return Response.json({ error: 'Submission not found' }, { status: 404 });
  }

  const body = await req.json();

  if (user.role === 'admin') {
    // Admin can approve or reject
    const { status, reviewNote } = body as {
      status: 'approved' | 'rejected';
      reviewNote?: string;
    };

    if (!status || !['approved', 'rejected'].includes(status)) {
      return Response.json(
        { error: 'status must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('enterprise_submissions')
      .update({
        status,
        reviewed_by: user.id,
        review_note: reviewNote ?? null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updated) {
      return Response.json(
        { error: updateError?.message ?? 'Failed to update submission' },
        { status: 500 }
      );
    }

    // Log to audit log
    await supabase.from('enterprise_audit_log').insert({
      company_id: user.company_id,
      submission_id: id,
      user_id: user.id,
      action: status,
      metadata: { review_note: reviewNote ?? null },
    });

    return Response.json({ submission: updated });
  } else {
    // Builder can update draft submissions or submit for review
    if (existing.builder_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status, appMapJson, dataContractJson, appName, appDescription } = body as {
      status?: string;
      appMapJson?: unknown;
      dataContractJson?: unknown;
      appName?: string;
      appDescription?: string;
    };

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (appName !== undefined) updates.app_name = appName;
    if (appDescription !== undefined) updates.app_description = appDescription;
    if (appMapJson !== undefined) updates.app_map_json = appMapJson;
    if (dataContractJson !== undefined) updates.data_contract_json = dataContractJson;

    if (status === 'pending') {
      if (!['draft', 'rejected'].includes(existing.status)) {
        return Response.json(
          { error: 'Can only submit drafts or rejected submissions for review' },
          { status: 400 }
        );
      }
      updates.status = 'pending';
    }

    const { data: updated, error: updateError } = await supabase
      .from('enterprise_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updated) {
      return Response.json(
        { error: updateError?.message ?? 'Failed to update submission' },
        { status: 500 }
      );
    }

    if (status === 'pending') {
      await supabase.from('enterprise_audit_log').insert({
        company_id: user.company_id,
        submission_id: id,
        user_id: user.id,
        action: 'submitted',
        metadata: {},
      });
    }

    return Response.json({ submission: updated });
  }
}
