'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createEnterpriseSupabaseClient } from '@/lib/enterprise/auth';
import { useMomentaiStore } from '@/lib/store';
import type { EnterpriseSubmission } from '@/lib/enterprise/types';
import type { AppMap } from '@/lib/types';

// ─── Demo mock HTML ──────────────────────────────────────────────────────────

const ESCALATION_TRACKER_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
body{background:#f8fafc;color:#0f172a;font-size:13px;height:100vh;overflow:hidden;display:flex;flex-direction:column}
.hdr{background:#fff;border-bottom:1px solid #e2e8f0;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.hdr-title{font-weight:600;font-size:14px}
.hdr-sub{font-size:11px;color:#64748b;margin-top:1px}
.body{display:flex;flex:1;overflow:hidden}
.nav{width:200px;background:#fff;border-right:1px solid #e2e8f0;padding:12px 0;flex-shrink:0}
.nav-sec{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;padding:8px 14px 4px}
.nav-item{padding:7px 14px;font-size:12px;color:#64748b;cursor:pointer;display:flex;align-items:center;gap:7px}
.nav-item.active{color:#2563eb;background:#eff6ff;font-weight:500;border-right:2px solid #2563eb}
.main{flex:1;overflow-y:auto;padding:20px}
.page-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}
.page-title{font-size:16px;font-weight:700}
.page-sub{font-size:11px;color:#64748b;margin-top:2px}
.btn{padding:6px 12px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid transparent;line-height:1}
.btn-primary{background:#2563eb;color:#fff}
.btn-ghost{background:#fff;color:#374151;border-color:#d1d5db}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.stat{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px}
.stat-val{font-size:22px;font-weight:700;color:#0f172a}
.stat-lbl{font-size:11px;color:#64748b;margin-top:2px}
.stat-chg{font-size:10px;margin-top:3px}
.red{color:#dc2626}.grn{color:#16a34a}.ylw{color:#b45309}
.filters{display:flex;gap:6px;margin-bottom:12px}
.fb{padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid #e2e8f0;background:#fff;color:#64748b}
.fb.on{background:#eff6ff;color:#2563eb;border-color:#bfdbfe}
table{width:100%;background:#fff;border-radius:8px;border:1px solid #e2e8f0;border-collapse:separate;border-spacing:0;overflow:hidden}
thead th{padding:9px 14px;text-align:left;font-size:11px;font-weight:600;color:#64748b;background:#f8fafc;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e2e8f0}
tbody td{padding:11px 14px;font-size:12px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover td{background:#fafafa}
.acct-name{font-weight:500;color:#0f172a}
.acct-arr{color:#94a3b8;font-size:11px;margin-top:1px}
.dot{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:5px;vertical-align:middle}
.badge{display:inline-flex;align-items:center;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600}
.badge.hi{background:#fee2e2;color:#991b1b}.badge.md{background:#fef3c7;color:#92400e}.badge.lo{background:#dcfce7;color:#166534}
.av{width:22px;height:22px;border-radius:50%;background:#dbeafe;color:#1e40af;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;margin-right:5px;vertical-align:middle}
.lnk{color:#2563eb;font-size:11px;font-weight:500;cursor:pointer}
.stale{color:#dc2626}
</style>
</head>
<body>
<div class="hdr">
  <div>
    <div class="hdr-title">Customer Escalation Tracker</div>
    <div class="hdr-sub">Acme Corp &middot; CSM Dashboard &middot; Synced from Salesforce 2m ago</div>
  </div>
  <div style="display:flex;gap:7px;align-items:center">
    <button class="btn btn-ghost">Send Weekly Digest</button>
    <button class="btn btn-primary">+ New Escalation</button>
  </div>
</div>
<div class="body">
  <div class="nav">
    <div class="nav-sec">Views</div>
    <div class="nav-item active">&#9632;&nbsp; At-Risk Accounts</div>
    <div class="nav-item">&#9675;&nbsp; Open Escalations</div>
    <div class="nav-item">&#10003;&nbsp; Resolved This Month</div>
    <div class="nav-sec" style="margin-top:6px">My Accounts</div>
    <div class="nav-item">Sarah Chen</div>
    <div class="nav-item">Marcus Rivera</div>
    <div class="nav-item">Priya Patel</div>
  </div>
  <div class="main">
    <div class="page-hdr">
      <div>
        <div class="page-title">At-Risk Accounts</div>
        <div class="page-sub">8 accounts flagged this week</div>
      </div>
      <button class="btn btn-ghost">Export CSV</button>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-val">8</div><div class="stat-lbl">At-Risk Accounts</div><div class="stat-chg red">&#8593; 3 from last week</div></div>
      <div class="stat"><div class="stat-val">$2.4M</div><div class="stat-lbl">ARR at Risk</div><div class="stat-chg red">+$340K from last week</div></div>
      <div class="stat"><div class="stat-val">5</div><div class="stat-lbl">Open Action Items</div><div class="stat-chg grn">&#8595; 2 resolved</div></div>
    </div>
    <div class="filters">
      <span class="fb on">All</span>
      <span class="fb">High Risk</span>
      <span class="fb">Medium Risk</span>
      <span class="fb">Needs Call</span>
      <span class="fb">No CSM Note</span>
    </div>
    <table>
      <thead><tr><th>Account</th><th>Risk</th><th>Open Opps</th><th>CSM</th><th>Last Contact</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td><div class="acct-name">TechFlow Inc.</div><div class="acct-arr">$420K ARR &middot; Enterprise</div></td><td><span class="dot" style="background:#ef4444"></span><span class="badge hi">High</span></td><td>2 open &middot; $180K</td><td><span class="av">SC</span>Sarah Chen</td><td class="stale">12 days ago</td><td><span class="lnk">Add Note</span></td></tr>
        <tr><td><div class="acct-name">Meridian Health</div><div class="acct-arr">$310K ARR &middot; Mid-Market</div></td><td><span class="dot" style="background:#ef4444"></span><span class="badge hi">High</span></td><td>1 open &middot; $95K</td><td><span class="av">MR</span>Marcus Rivera</td><td class="stale">9 days ago</td><td><span class="lnk">Add Note</span></td></tr>
        <tr><td><div class="acct-name">Globalink Logistics</div><div class="acct-arr">$280K ARR &middot; Enterprise</div></td><td><span class="dot" style="background:#f59e0b"></span><span class="badge md">Medium</span></td><td>3 open &middot; $220K</td><td><span class="av">PP</span>Priya Patel</td><td class="ylw">5 days ago</td><td><span class="lnk">Add Note</span></td></tr>
        <tr><td><div class="acct-name">Skybridge Capital</div><div class="acct-arr">$195K ARR &middot; SMB</div></td><td><span class="dot" style="background:#f59e0b"></span><span class="badge md">Medium</span></td><td>0 open</td><td><span class="av">SC</span>Sarah Chen</td><td style="color:#64748b">3 days ago</td><td><span class="lnk">Add Note</span></td></tr>
        <tr><td><div class="acct-name">Northbridge Media</div><div class="acct-arr">$155K ARR &middot; Mid-Market</div></td><td><span class="dot" style="background:#22c55e"></span><span class="badge lo">Low</span></td><td>1 open &middot; $45K</td><td><span class="av">MR</span>Marcus Rivera</td><td style="color:#64748b">1 day ago</td><td><span class="lnk">View</span></td></tr>
      </tbody>
    </table>
  </div>
</div>
</body>
</html>`;

const ONBOARDING_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
body{background:#f8fafc;color:#0f172a;font-size:13px;height:100vh;overflow:hidden;display:flex;flex-direction:column}
.hdr{background:#fff;border-bottom:1px solid #e2e8f0;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.hdr-title{font-weight:600;font-size:14px}
.hdr-sub{font-size:11px;color:#64748b;margin-top:1px}
.body{display:flex;flex:1;overflow:hidden}
.side{width:220px;background:#fff;border-right:1px solid #e2e8f0;padding:16px;flex-shrink:0}
.hire-card{background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px;margin-bottom:14px}
.hire-name{font-weight:600;font-size:13px;color:#0369a1}
.hire-role{font-size:11px;color:#0284c7;margin-top:1px}
.hire-start{font-size:10px;color:#64748b;margin-top:6px}
.prog-label{font-size:11px;font-weight:600;color:#0f172a;margin-bottom:6px}
.prog-bar{height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin-bottom:8px}
.prog-fill{height:100%;background:#16a34a;border-radius:3px}
.prog-pct{font-size:10px;color:#64748b}
.main{flex:1;overflow-y:auto;padding:20px}
.section{margin-bottom:20px}
.sec-title{font-size:12px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.sec-badge{padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600;text-transform:none;letter-spacing:0}
.task-card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:11px 14px;margin-bottom:6px;display:flex;align-items:flex-start;gap:10px}
.task-card.done{opacity:.6}
.check{width:18px;height:18px;border-radius:4px;border:1.5px solid #d1d5db;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center}
.check.filled{background:#16a34a;border-color:#16a34a;color:#fff;font-size:11px}
.check.pending{border-color:#2563eb}
.task-name{font-size:12px;font-weight:500;color:#0f172a}
.task-sub{font-size:11px;color:#64748b;margin-top:2px}
.task-owner{font-size:10px;color:#94a3b8;margin-top:3px}
.chip{display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:500;margin-left:6px}
.chip.it{background:#ede9fe;color:#6d28d9}
.chip.mgr{background:#fef3c7;color:#92400e}
.chip.hr{background:#dcfce7;color:#166534}
</style>
</head>
<body>
<div class="hdr">
  <div>
    <div class="hdr-title">Employee Onboarding</div>
    <div class="hdr-sub">Acme Corp &middot; New Hire Checklist &middot; IT &amp; Manager View</div>
  </div>
  <div style="display:flex;gap:7px">
    <button style="padding:5px 11px;border-radius:6px;font-size:11px;background:#fff;border:1px solid #d1d5db;cursor:pointer;font-weight:500">All Hires</button>
    <button style="padding:5px 11px;border-radius:6px;font-size:11px;background:#2563eb;color:#fff;border:none;cursor:pointer;font-weight:500">+ Add New Hire</button>
  </div>
</div>
<div class="body">
  <div class="side">
    <div class="hire-card">
      <div class="hire-name">Jordan Kim</div>
      <div class="hire-role">Software Engineer, Platform</div>
      <div class="hire-start">Start date: May 12, 2026</div>
    </div>
    <div class="prog-label">Onboarding Progress</div>
    <div class="prog-bar"><div class="prog-fill" style="width:58%"></div></div>
    <div class="prog-pct">7 of 12 tasks complete</div>
  </div>
  <div class="main">
    <div class="section">
      <div class="sec-title">
        &#10003; Completed
        <span class="sec-badge" style="background:#dcfce7;color:#166534">7 done</span>
      </div>
      <div class="task-card done"><div class="check filled">&#10003;</div><div><div class="task-name">Send offer letter &amp; I-9 forms<span class="chip hr">HR</span></div><div class="task-sub">DocuSign sent &amp; signed</div></div></div>
      <div class="task-card done"><div class="check filled">&#10003;</div><div><div class="task-name">Create employee record<span class="chip hr">HR</span></div><div class="task-sub">Added to HR database</div></div></div>
      <div class="task-card done"><div class="check filled">&#10003;</div><div><div class="task-name">Provision corporate email<span class="chip it">IT</span></div><div class="task-sub">jordan.kim@acme.com</div></div></div>
      <div class="task-card done"><div class="check filled">&#10003;</div><div><div class="task-name">Set up laptop &amp; ship<span class="chip it">IT</span></div><div class="task-sub">MacBook Pro M3 — shipped May 8</div></div></div>
    </div>
    <div class="section">
      <div class="sec-title">
        &#9679; Pending
        <span class="sec-badge" style="background:#fef3c7;color:#92400e">5 remaining</span>
      </div>
      <div class="task-card"><div class="check pending"></div><div><div class="task-name">Grant repo access<span class="chip it">IT</span></div><div class="task-sub">Waiting for manager approval</div><div class="task-owner">Assigned to: IT &middot; Awaiting: <strong>Alex Morgan</strong> (Manager)</div></div></div>
      <div class="task-card"><div class="check"></div><div><div class="task-name">Add to Slack channels<span class="chip it">IT</span></div><div class="task-sub">#platform-eng, #all-hands, #eng-standup</div></div></div>
      <div class="task-card"><div class="check"></div><div><div class="task-name">Schedule first 1:1 with manager<span class="chip mgr">Manager</span></div><div class="task-sub">Target: first day</div></div></div>
      <div class="task-card"><div class="check"></div><div><div class="task-name">Complete security training<span class="chip hr">HR</span></div><div class="task-sub">Due within first 5 business days</div></div></div>
      <div class="task-card"><div class="check"></div><div><div class="task-name">Enroll in benefits<span class="chip hr">HR</span></div><div class="task-sub">Deadline: 30 days from start</div></div></div>
    </div>
  </div>
</div>
</body>
</html>`;

// ─── Demo app maps ────────────────────────────────────────────────────────────

const ESCALATION_APP_MAP: AppMap = {
  appName: 'Customer Escalation Tracker',
  appDescription: 'Pulls at-risk accounts from Salesforce, lets CSMs add notes, sends weekly digest to VP of Customer Success',
  appPlatform: 'web',
  journeys: [
    { id: 'j1', name: 'CSM Dashboard', description: 'View and manage at-risk accounts' },
    { id: 'j2', name: 'Escalation Actions', description: 'Add notes and send digest' },
  ],
  moments: [
    {
      id: 'm1', journeyId: 'j1', label: 'At-Risk Accounts', description: 'Table of accounts flagged for escalation, pulled from Salesforce', type: 'ui',
      preview: '', position: { x: 100, y: 100 }, mockHtml: ESCALATION_TRACKER_HTML,
    },
    {
      id: 'm2', journeyId: 'j2', label: 'Add CSM Note', description: 'Add a note to an account with action items', type: 'ui',
      preview: '', position: { x: 400, y: 100 },
    },
    {
      id: 'm3', journeyId: 'j2', label: 'Send Weekly Digest', description: 'Auto-generates digest and emails VP of Customer Success', type: 'ai',
      preview: '', position: { x: 700, y: 100 },
    },
  ],
  edges: [
    { id: 'e1', source: 'm1', target: 'm2', label: 'Add Note' },
    { id: 'e2', source: 'm1', target: 'm3', label: 'Send Digest' },
  ],
  stateSchema: [],
  initialState: {},
};

const ONBOARDING_APP_MAP: AppMap = {
  appName: 'Employee Onboarding Checklist',
  appDescription: 'New hire completes checklist, IT gets notified on each step, manager approves access',
  appPlatform: 'web',
  journeys: [
    { id: 'j1', name: 'Onboarding Workflow', description: 'Track and complete new hire tasks' },
  ],
  moments: [
    {
      id: 'm1', journeyId: 'j1', label: 'Checklist Dashboard', description: 'View all onboarding tasks by new hire with progress tracking', type: 'ui',
      preview: '', position: { x: 100, y: 100 }, mockHtml: ONBOARDING_HTML,
    },
    {
      id: 'm2', journeyId: 'j1', label: 'IT Provisioning Step', description: 'IT confirms hardware shipped and accounts created', type: 'data',
      preview: '', position: { x: 400, y: 100 },
    },
    {
      id: 'm3', journeyId: 'j1', label: 'Manager Access Approval', description: 'Manager approves repo and system access for new hire', type: 'ui',
      preview: '', position: { x: 700, y: 100 },
    },
  ],
  edges: [
    { id: 'e1', source: 'm1', target: 'm2', label: 'IT Task Complete' },
    { id: 'e2', source: 'm2', target: 'm3', label: 'Needs Approval' },
  ],
  stateSchema: [],
  initialState: {},
};

// ─── Demo submissions ─────────────────────────────────────────────────────────

const DEMO_SUBMISSIONS: EnterpriseSubmission[] = [
  {
    id: '1', company_id: 'demo', builder_id: 'u1',
    app_name: 'Customer Escalation Tracker',
    app_description: 'Pulls at-risk accounts from Salesforce, lets CSMs add notes, sends weekly digest to VP of Customer Success',
    app_map_json: ESCALATION_APP_MAP,
    data_contract_json: [
      { source_name: 'Salesforce CRM', source_type: 'rest_api', operations: [{ type: 'read', resource: 'Account', reason: 'Load at-risk accounts list' }, { type: 'read', resource: 'Opportunity', reason: 'Check open deal values' }] },
      { source_name: 'Company Postgres', source_type: 'postgres', operations: [{ type: 'write', resource: 'escalations', reason: 'Save CSM notes and action items' }, { type: 'read', resource: 'escalations', reason: 'Load previous notes on return visit' }] },
    ],
    status: 'pending', created_at: new Date(Date.now() - 2 * 3600000).toISOString(), updated_at: new Date().toISOString(),
    builder: { id: 'u1', auth_user_id: 'a1', company_id: 'demo', email: 'sarah@acme.com', full_name: 'Sarah Chen', role: 'builder', created_at: new Date().toISOString() },
  },
  {
    id: '2', company_id: 'demo', builder_id: 'u2',
    app_name: 'Employee Onboarding Checklist',
    app_description: 'New hire completes checklist, IT gets notified on each step, manager approves access',
    app_map_json: ONBOARDING_APP_MAP,
    data_contract_json: [
      { source_name: 'HR Database', source_type: 'postgres', operations: [{ type: 'read', resource: 'employees', reason: 'Load new hire details' }, { type: 'write', resource: 'onboarding_tasks', reason: 'Record completed tasks' }] },
    ],
    status: 'pending', created_at: new Date(Date.now() - 24 * 3600000).toISOString(), updated_at: new Date().toISOString(),
    builder: { id: 'u2', auth_user_id: 'a2', company_id: 'demo', email: 'marcus@acme.com', full_name: 'Marcus Rivera', role: 'builder', created_at: new Date().toISOString() },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams<{ submissionId: string }>();
  const submissionId = params.submissionId;

  const [token, setToken] = useState<string | null>(null);
  const [submission, setSubmission] = useState<EnterpriseSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);

  const setAppMap = useMomentaiStore((s) => s.setAppMap);

  useEffect(() => {
    const supabase = createEnterpriseSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        // Demo mode — show mock submission
        const demo = DEMO_SUBMISSIONS.find((s) => s.id === submissionId) ?? DEMO_SUBMISSIONS[0];
        setSubmission(demo);
        if (demo.app_map_json && Object.keys(demo.app_map_json).length > 0) {
          setAppMap(demo.app_map_json as AppMap);
        }
        setLoading(false);
        return;
      }
      setToken(session.access_token);

      const res = await fetch(`/api/enterprise/submissions/${submissionId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        router.push('/enterprise/admin');
        return;
      }

      const json = await res.json();
      const sub: EnterpriseSubmission = json.submission;
      setSubmission(sub);

      if (sub.app_map_json) {
        setAppMap(sub.app_map_json as AppMap);
      }

      setLoading(false);
    });
  }, [submissionId, router, setAppMap]);

  async function handleDecision(status: 'approved' | 'rejected') {
    if (!token) return;
    if (status === 'rejected' && !reviewNote.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    setSubmitting(true);
    setError('');

    const res = await fetch(`/api/enterprise/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, reviewNote: reviewNote.trim() || undefined }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? 'Failed to submit decision');
      setSubmitting(false);
      return;
    }

    setDecision(status);
    setSubmitting(false);

    setTimeout(() => {
      router.push('/enterprise/admin');
    }, 1500);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!submission) return null;

  const alreadyReviewed = ['approved', 'rejected', 'live'].includes(submission.status);
  const isWebApp = submission.app_map_json?.appPlatform === 'web';

  // First moment with a preview
  const previewMoment = submission.app_map_json?.moments?.find(
    (m) => m.mockHtml || m.componentCode
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/enterprise/admin')}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            ← Admin
          </button>
          <span className="text-zinc-700">|</span>
          <span className="text-white font-medium text-sm">Review: {submission.app_name}</span>
          {alreadyReviewed && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                submission.status === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : submission.status === 'rejected'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}
            >
              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
            </span>
          )}
        </div>
      </header>

      {/* Decision banner */}
      {decision && (
        <div
          className={`shrink-0 border-b px-6 py-3 text-sm font-medium ${
            decision === 'approved'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {decision === 'approved'
            ? 'App approved. Redirecting to admin dashboard...'
            : 'App rejected. Redirecting to admin dashboard...'}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL — 55% */}
        <div className="w-[55%] overflow-y-auto border-r border-zinc-800 p-6 space-y-8">
          {/* App info */}
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{submission.app_name}</h2>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span>
                by{' '}
                <span className="text-zinc-300">
                  {submission.builder?.full_name ?? submission.builder?.email ?? 'Unknown'}
                </span>
              </span>
              <span>·</span>
              <span>Submitted {new Date(submission.created_at).toLocaleDateString()}</span>
              {isWebApp && (
                <>
                  <span>·</span>
                  <span className="text-xs px-1.5 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium">
                    Web App
                  </span>
                </>
              )}
            </div>
            {submission.app_description && (
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                {submission.app_description}
              </p>
            )}
          </div>

          {/* Data Contract */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
              Data Contract
            </h3>
            {!submission.data_contract_json || submission.data_contract_json.length === 0 ? (
              <p className="text-zinc-600 text-sm bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
                No external data connections declared for this app.
              </p>
            ) : (
              <div className="space-y-4">
                {submission.data_contract_json.map((entry, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-white font-medium text-sm">{entry.source_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {entry.source_type}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {entry.operations.map((op, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <span
                            className={`shrink-0 text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                              op.type === 'read'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}
                          >
                            {op.type}
                          </span>
                          <div>
                            <p className="text-zinc-300 text-sm font-medium">{op.resource}</p>
                            <p className="text-zinc-500 text-xs mt-0.5">{op.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* App Map — readable list */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
              App Map
            </h3>
            {!submission.app_map_json?.journeys ||
            submission.app_map_json.journeys.length === 0 ? (
              <p className="text-zinc-600 text-sm bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
                No journeys defined yet.
              </p>
            ) : (
              <div className="space-y-6">
                {submission.app_map_json.journeys.map((journey, ji) => {
                  const journeyMoments = submission.app_map_json.moments.filter(
                    (m) => m.journeyId === journey.id
                  );
                  return (
                    <div key={journey.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <span className="text-zinc-400 text-xs font-bold">{ji + 1}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{journey.name}</p>
                          {journey.description && (
                            <p className="text-zinc-500 text-xs">{journey.description}</p>
                          )}
                        </div>
                      </div>
                      {journeyMoments.length > 0 && (
                        <div className="ml-8 space-y-2">
                          {journeyMoments.map((moment, mi) => (
                            <div
                              key={moment.id}
                              className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
                            >
                              <span className="shrink-0 text-zinc-600 text-xs mt-0.5">
                                {mi + 1}.
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-200 text-sm font-medium">
                                    {moment.label}
                                  </span>
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
                                      moment.type === 'ui'
                                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        : moment.type === 'ai'
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : moment.type === 'data'
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    }`}
                                  >
                                    {moment.type}
                                  </span>
                                </div>
                                {moment.description && (
                                  <p className="text-zinc-500 text-xs mt-0.5">
                                    {moment.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Review Note + Actions */}
          {!alreadyReviewed && !decision && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-3">
                Review Note
              </h3>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add a note for the builder (required when rejecting)..."
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition resize-none text-sm"
              />
              {error && (
                <p className="text-red-400 text-sm mt-2 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleDecision('approved')}
                  disabled={submitting}
                  className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 text-sm"
                >
                  {submitting ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleDecision('rejected')}
                  disabled={submitting}
                  className="flex-1 py-3 bg-zinc-800 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-50 text-sm"
                >
                  {submitting ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          )}

          {alreadyReviewed && submission.review_note && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                Review note
              </p>
              <p className="text-zinc-300 text-sm">{submission.review_note}</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — 45% live preview */}
        <div className="w-[45%] flex flex-col bg-zinc-950">
          <div className="shrink-0 px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Live Preview
            </p>
            {isWebApp && (
              <span className="text-xs text-zinc-600">— desktop web app</span>
            )}
          </div>

          {isWebApp ? (
            /* Desktop web app preview — browser chrome */
            <div className="flex-1 flex flex-col overflow-hidden p-4">
              <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-zinc-700 shadow-2xl">
                {/* Browser chrome */}
                <div className="shrink-0 h-9 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 gap-2">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <div className="flex-1 bg-zinc-800 rounded-md h-5 flex items-center px-2 mx-1 min-w-0">
                    <span className="text-zinc-500 text-[10px] font-mono truncate">
                      {submission.app_name.toLowerCase().replace(/\s+/g, '-')}.acme.internal
                    </span>
                  </div>
                </div>
                {/* App content */}
                <div className="flex-1 relative overflow-hidden">
                  {previewMoment?.mockHtml ? (
                    <iframe
                      srcDoc={previewMoment.mockHtml}
                      className="w-full h-full border-0 block"
                      sandbox="allow-scripts allow-same-origin"
                      title="App Preview"
                    />
                  ) : (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <p className="text-zinc-400 text-sm">Preview not available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Mobile app preview — phone frame */
            <div className="flex-1 flex items-start justify-center overflow-y-auto py-6">
              {previewMoment?.mockHtml ? (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="bg-zinc-900 rounded-[36px] border-[3px] border-zinc-700 shadow-2xl overflow-hidden"
                    style={{ width: 280 }}
                  >
                    <div className="h-7 bg-zinc-900 flex items-center justify-center">
                      <div className="w-16 h-3 bg-zinc-800 rounded-b-xl" />
                    </div>
                    <div className="bg-white overflow-hidden relative" style={{ height: 606 }}>
                      <iframe
                        srcDoc={previewMoment.mockHtml}
                        className="border-0 bg-white"
                        sandbox="allow-scripts allow-same-origin"
                        title="App Preview"
                        style={{ width: 390, height: 844, transform: 'scale(0.718)', transformOrigin: 'top left' }}
                      />
                    </div>
                    <div className="h-5 bg-zinc-900 flex items-center justify-center">
                      <div className="w-20 h-1 bg-zinc-600 rounded-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-zinc-600 text-sm mt-20">No preview available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
