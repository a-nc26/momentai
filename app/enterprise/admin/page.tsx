'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createEnterpriseSupabaseClient } from '@/lib/enterprise/auth';
import type { EnterpriseSubmission, EnterpriseDataSource, EnterpriseCompany } from '@/lib/enterprise/types';

const DEMO_SUBMISSIONS: EnterpriseSubmission[] = [
  { id: '1', company_id: 'demo', builder_id: 'u1', app_name: 'Customer Escalation Tracker', app_description: 'Pulls at-risk accounts from Salesforce, lets CSMs add notes, sends weekly digest to VP', app_map_json: {} as never, data_contract_json: [{ source_name: 'Salesforce CRM', source_type: 'rest_api', operations: [{ type: 'read', resource: 'Account', reason: 'Load at-risk accounts' }, { type: 'read', resource: 'Opportunity', reason: 'Check deal status' }] }, { source_name: 'Company Postgres', source_type: 'postgres', operations: [{ type: 'write', resource: 'escalations', reason: 'Save CSM notes' }] }], status: 'pending', created_at: new Date(Date.now() - 2 * 3600000).toISOString(), updated_at: new Date().toISOString(), builder: { id: 'u1', auth_user_id: 'a1', company_id: 'demo', email: 'sarah@acme.com', full_name: 'Sarah Chen', role: 'builder', created_at: new Date().toISOString() } },
  { id: '2', company_id: 'demo', builder_id: 'u2', app_name: 'Employee Onboarding Checklist', app_description: 'New hire completes checklist, IT gets notified on each step, manager approves access', app_map_json: {} as never, data_contract_json: [{ source_name: 'HR Database', source_type: 'postgres', operations: [{ type: 'read', resource: 'employees', reason: 'Load new hire details' }, { type: 'write', resource: 'onboarding_tasks', reason: 'Record completed tasks' }] }], status: 'pending', created_at: new Date(Date.now() - 24 * 3600000).toISOString(), updated_at: new Date().toISOString(), builder: { id: 'u2', auth_user_id: 'a2', company_id: 'demo', email: 'marcus@acme.com', full_name: 'Marcus Rivera', role: 'builder', created_at: new Date().toISOString() } },
  { id: '3', company_id: 'demo', builder_id: 'u3', app_name: 'Vendor Invoice Approval', app_description: 'Finance team reviews and approves vendor invoices with multi-level sign-off', app_map_json: {} as never, data_contract_json: [{ source_name: 'Finance API', source_type: 'rest_api', operations: [{ type: 'read', resource: '/invoices', reason: 'Load pending invoices' }, { type: 'write', resource: '/invoices/approve', reason: 'Record approval decision' }] }], status: 'live', live_url: 'https://app.momentum.com/run/abc123', created_at: new Date(Date.now() - 7 * 86400000).toISOString(), updated_at: new Date().toISOString(), builder: { id: 'u3', auth_user_id: 'a3', company_id: 'demo', email: 'priya@acme.com', full_name: 'Priya Patel', role: 'builder', created_at: new Date().toISOString() } },
  { id: '4', company_id: 'demo', builder_id: 'u1', app_name: 'Weekly Sales Pipeline Review', app_description: 'Automated weekly report pulling CRM data and surfacing deals that need attention', app_map_json: {} as never, data_contract_json: [], status: 'draft', created_at: new Date(Date.now() - 30 * 60000).toISOString(), updated_at: new Date().toISOString(), builder: { id: 'u1', auth_user_id: 'a1', company_id: 'demo', email: 'sarah@acme.com', full_name: 'Sarah Chen', role: 'builder', created_at: new Date().toISOString() } },
];
const DEMO_SOURCES: EnterpriseDataSource[] = [
  { id: 's1', company_id: 'demo', name: 'Company Postgres', type: 'postgres', description: 'Main production database — customers, orders, employees', created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 's2', company_id: 'demo', name: 'Salesforce CRM', type: 'rest_api', description: 'Sales pipeline, accounts, opportunities, contacts', created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 's3', company_id: 'demo', name: 'HR Database', type: 'postgres', description: 'Employee records, org structure, payroll metadata', created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
];

type Tab = 'pending' | 'all' | 'sources';
type StatusFilter = 'all' | EnterpriseSubmission['status'];

function StatusBadge({ status }: { status: EnterpriseSubmission['status'] }) {
  const styles: Record<EnterpriseSubmission['status'], string> = {
    draft: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    live: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  const labels: Record<EnterpriseSubmission['status'], string> = {
    draft: 'Draft',
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    live: 'Live',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [company, setCompany] = useState<EnterpriseCompany | null>(null);
  const [submissions, setSubmissions] = useState<EnterpriseSubmission[]>([]);
  const [dataSources, setDataSources] = useState<EnterpriseDataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState<'postgres' | 'rest_api' | 'none'>('none');
  const [sourceDescription, setSourceDescription] = useState('');
  const [addingSource, setAddingSource] = useState(false);
  const [addSourceError, setAddSourceError] = useState('');

  const loadData = useCallback(async (authToken: string) => {
    const [subsRes, sourcesRes] = await Promise.all([
      fetch('/api/enterprise/submissions', {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
      fetch('/api/enterprise/data-sources', {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    ]);

    if (subsRes.ok) {
      const json = await subsRes.json();
      const subs: EnterpriseSubmission[] = json.submissions ?? [];
      setSubmissions(subs);
      // Derive company from first submission with builder info
      const withCompany = subs.find((s) => s.builder?.company);
      if (withCompany?.builder?.company) {
        setCompany(withCompany.builder.company);
      }
    }

    if (sourcesRes.ok) {
      const json = await sourcesRes.json();
      setDataSources(json.dataSources ?? []);
    }
  }, []);

  useEffect(() => {
    const supabase = createEnterpriseSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        // Demo mode — show mock data so the UI is visible without auth
        setCompany({ id: 'demo', name: 'Acme Corp', domain: 'acme.com', created_at: new Date().toISOString() });
        setSubmissions(DEMO_SUBMISSIONS);
        setDataSources(DEMO_SOURCES);
        setLoading(false);
        return;
      }
      setToken(session.access_token);
      await loadData(session.access_token);
      setLoading(false);
    });
  }, [router, loadData]);

  async function handleSignOut() {
    const supabase = createEnterpriseSupabaseClient();
    await supabase.auth.signOut();
    router.push('/enterprise');
  }

  async function handleAddSource(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setAddingSource(true);
    setAddSourceError('');

    const res = await fetch('/api/enterprise/data-sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: sourceName, type: sourceType, description: sourceDescription }),
    });

    const json = await res.json();
    if (!res.ok) {
      setAddSourceError(json.error ?? 'Failed to add source');
      setAddingSource(false);
      return;
    }

    setDataSources((prev) => [json.dataSource, ...prev]);
    setSourceName('');
    setSourceType('none');
    setSourceDescription('');
    setShowAddSource(false);
    setAddingSource(false);
  }

  const pending = submissions.filter((s) => s.status === 'pending');
  const live = submissions.filter((s) => s.status === 'live');

  const filteredAll =
    statusFilter === 'all'
      ? submissions
      : submissions.filter((s) => s.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-zinc-950 rounded-sm" />
            </div>
            <span className="text-white font-semibold tracking-tight">Momentum</span>
            {company && (
              <>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-400 text-sm">{company.name}</span>
              </>
            )}
            <span className="text-xs text-purple-400 border border-purple-500/30 bg-purple-500/10 rounded px-1.5 py-0.5 font-medium">
              IT Admin
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-1">
                Total Apps
              </p>
              <p className="text-3xl font-bold text-white">{submissions.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-1">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-yellow-400">{pending.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-1">
                Live Apps
              </p>
              <p className="text-3xl font-bold text-blue-400">{live.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-zinc-800">
          {[
            { id: 'pending' as Tab, label: 'Pending Review', count: pending.length },
            { id: 'all' as Tab, label: 'All Apps', count: submissions.length },
            { id: 'sources' as Tab, label: 'Data Sources', count: dataSources.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 ${
                    activeTab === tab.id
                      ? 'bg-zinc-700 text-zinc-300'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div>
            {pending.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-zinc-500">No apps pending review</p>
                <p className="text-zinc-600 text-sm mt-1">
                  Apps submitted by builders will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium text-sm">{submission.app_name}</h3>
                        <StatusBadge status={submission.status} />
                      </div>
                      <p className="text-zinc-500 text-xs">
                        by {submission.builder?.full_name ?? submission.builder?.email ?? 'Unknown'}
                        {' · '}
                        {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                      {(submission.data_contract_json?.length ?? 0) > 0 && (
                        <p className="text-zinc-600 text-xs mt-1">
                          {submission.data_contract_json.length} data connection
                          {submission.data_contract_json.length !== 1 ? 's' : ''}:{' '}
                          {submission.data_contract_json
                            .map((d) => d.source_name)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        router.push(`/enterprise/admin/review/${submission.id}`)
                      }
                      className="ml-4 px-4 py-2 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-100 transition-colors text-sm"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Apps Tab */}
        {activeTab === 'all' && (
          <div>
            <div className="flex gap-2 mb-4">
              {(['all', 'draft', 'pending', 'approved', 'rejected', 'live'] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === s
                        ? 'bg-white text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                )
              )}
            </div>
            {filteredAll.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-zinc-500">No apps found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAll.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">
                          {submission.app_name}
                        </span>
                        <StatusBadge status={submission.status} />
                      </div>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        by {submission.builder?.full_name ?? submission.builder?.email ?? 'Unknown'}
                        {' · '}
                        {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        router.push(`/enterprise/admin/review/${submission.id}`)
                      }
                      className="ml-4 text-xs text-zinc-400 hover:text-white transition-colors font-medium"
                    >
                      View →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Data Sources Tab */}
        {activeTab === 'sources' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowAddSource(true)}
                className="px-4 py-2 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-100 transition-colors text-sm"
              >
                + Add Source
              </button>
            </div>

            {showAddSource && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6">
                <h3 className="text-white font-semibold mb-4">Register a data source</h3>
                <form onSubmit={handleAddSource} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                      Source name
                    </label>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="e.g. HR Database, Employee API"
                      required
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Type</label>
                    <select
                      value={sourceType}
                      onChange={(e) =>
                        setSourceType(e.target.value as 'postgres' | 'rest_api' | 'none')
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
                    >
                      <option value="none">None (no external data)</option>
                      <option value="postgres">PostgreSQL</option>
                      <option value="rest_api">REST API</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                      Description{' '}
                      <span className="text-zinc-600 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={sourceDescription}
                      onChange={(e) => setSourceDescription(e.target.value)}
                      placeholder="What data does this source contain?"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
                    />
                  </div>
                  {addSourceError && (
                    <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                      {addSourceError}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={addingSource}
                      className="px-5 py-2.5 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm"
                    >
                      {addingSource ? 'Adding...' : 'Add source'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddSource(false)}
                      className="px-5 py-2.5 text-zinc-400 hover:text-white transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {dataSources.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-zinc-500">No data sources registered</p>
                <p className="text-zinc-600 text-sm mt-1">
                  Register approved data sources that builders can reference
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dataSources.map((source) => (
                  <div
                    key={source.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{source.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {source.type === 'postgres'
                            ? 'PostgreSQL'
                            : source.type === 'rest_api'
                            ? 'REST API'
                            : 'No data'}
                        </span>
                      </div>
                      {source.description && (
                        <p className="text-zinc-500 text-xs mt-0.5">{source.description}</p>
                      )}
                    </div>
                    <span className="text-zinc-600 text-xs">
                      {new Date(source.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
