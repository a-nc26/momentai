'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createEnterpriseSupabaseClient } from '@/lib/enterprise/auth';
import type { EnterpriseSubmission, EnterpriseUser, EnterpriseCompany } from '@/lib/enterprise/types';

type StatusBadgeProps = { status: EnterpriseSubmission['status'] };

function StatusBadge({ status }: StatusBadgeProps) {
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
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const [user, setUser] = useState<EnterpriseUser | null>(null);
  const [company, setCompany] = useState<EnterpriseCompany | null>(null);
  const [submissions, setSubmissions] = useState<EnterpriseSubmission[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewApp, setShowNewApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDescription, setNewAppDescription] = useState('');
  const [newAppIdea, setNewAppIdea] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadSubmissions = useCallback(async (authToken: string) => {
    const res = await fetch('/api/enterprise/submissions', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.ok) {
      const json = await res.json();
      setSubmissions(json.submissions ?? []);
    }
  }, []);

  useEffect(() => {
    const supabase = createEnterpriseSupabaseClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/enterprise');
        return;
      }

      setToken(session.access_token);

      // Fetch enterprise user profile
      const res = await fetch('/api/enterprise/submissions', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.status === 401) {
        router.push('/enterprise');
        return;
      }

      // Get user info from auth
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUser({
          id: '',
          auth_user_id: userData.user.id,
          company_id: '',
          email: userData.user.email ?? '',
          full_name: userData.user.user_metadata?.full_name ?? null,
          role: 'builder',
          created_at: '',
        });
      }

      if (res.ok) {
        const json = await res.json();
        setSubmissions(json.submissions ?? []);
      }

      setLoading(false);
    });
  }, [router]);

  // Also load user details from a submission if available
  useEffect(() => {
    if (submissions.length > 0 && submissions[0].builder) {
      const b = submissions[0].builder;
      setUser(b);
      if (b.company) setCompany(b.company);
    }
  }, [submissions]);

  async function handleSignOut() {
    const supabase = createEnterpriseSupabaseClient();
    await supabase.auth.signOut();
    router.push('/enterprise');
  }

  async function handleCreateApp(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !newAppName) return;
    setCreating(true);
    setCreateError('');

    const initialAppMap = {
      appName: newAppName,
      appDescription: newAppIdea || newAppDescription,
      journeys: [],
      moments: [],
      edges: [],
    };

    const res = await fetch('/api/enterprise/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        appName: newAppName,
        appDescription: newAppDescription || newAppIdea,
        appMapJson: initialAppMap,
        dataContractJson: [],
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setCreateError(json.error ?? 'Failed to create app');
      setCreating(false);
      return;
    }

    router.push(`/enterprise/workspace/build/${json.submission.id}`);
  }

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
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-zinc-400 text-sm">
                {user.full_name ?? user.email}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Apps</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Build internal tools and submit them for IT review
            </p>
          </div>
          <button
            onClick={() => setShowNewApp(true)}
            className="px-4 py-2 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-100 transition-colors text-sm"
          >
            + New App
          </button>
        </div>

        {/* New App Form */}
        {showNewApp && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-4">Create a new app</h2>
            <form onSubmit={handleCreateApp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">App name</label>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="e.g. Employee Onboarding Tracker"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Description{' '}
                  <span className="text-zinc-600 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newAppDescription}
                  onChange={(e) => setNewAppDescription(e.target.value)}
                  placeholder="One-line description of the app"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  What should this app do?
                </label>
                <textarea
                  value={newAppIdea}
                  onChange={(e) => setNewAppIdea(e.target.value)}
                  placeholder="Describe the problem this app solves and what it should let users do..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition resize-none"
                />
              </div>
              {createError && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {createError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm"
                >
                  {creating ? 'Creating...' : 'Start building'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewApp(false)}
                  className="px-5 py-2.5 text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Submissions Grid */}
        {submissions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-zinc-600 text-4xl mb-4">▢</div>
            <p className="text-zinc-500 mb-2">No apps yet</p>
            <p className="text-zinc-600 text-sm">
              Create your first app to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate">
                      {submission.app_name}
                    </h3>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>
                {submission.app_description && (
                  <p className="text-zinc-500 text-xs mb-4 line-clamp-2 flex-1">
                    {submission.app_description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800">
                  <span className="text-zinc-600 text-xs">
                    {submission.data_contract_json?.length ?? 0} data connection
                    {(submission.data_contract_json?.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() =>
                      router.push(`/enterprise/workspace/build/${submission.id}`)
                    }
                    className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                  >
                    Open →
                  </button>
                </div>
                {submission.review_note && submission.status === 'rejected' && (
                  <div className="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-xs">
                      <span className="font-medium">Rejected:</span> {submission.review_note}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
