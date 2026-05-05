'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createEnterpriseSupabaseClient } from '@/lib/enterprise/auth';
import { useMomentaiStore } from '@/lib/store';
import ReactRuntime from '@/components/runtime/ReactRuntime';
import type { EnterpriseSubmission } from '@/lib/enterprise/types';
import type { AppMap } from '@/lib/types';

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
  const appMap = useMomentaiStore((s) => s.appMap);

  useEffect(() => {
    const supabase = createEnterpriseSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/enterprise');
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
        {/* LEFT PANEL — 60% */}
        <div className="w-[60%] overflow-y-auto border-r border-zinc-800 p-6 space-y-8">
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
                  <div
                    key={i}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                  >
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

        {/* RIGHT PANEL — 40% */}
        <div className="w-[40%] flex flex-col bg-zinc-950">
          <div className="shrink-0 px-4 py-3 border-b border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Live Preview
            </p>
          </div>
          <div className="flex-1 flex items-start justify-center overflow-y-auto py-6">
            {appMap ? (
              <ReactRuntime appMap={appMap} phoneWidth={300} showEditor={false} />
            ) : (
              <div className="text-zinc-600 text-sm mt-20">No preview available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
