'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createEnterpriseSupabaseClient } from '@/lib/enterprise/auth';
import { useMomentaiStore } from '@/lib/store';
import Canvas from '@/components/Canvas';
import ReactRuntime from '@/components/runtime/ReactRuntime';
import type { EnterpriseSubmission } from '@/lib/enterprise/types';
import type { AppMap } from '@/lib/types';

export default function BuildPage() {
  const router = useRouter();
  const params = useParams<{ submissionId: string }>();
  const submissionId = params.submissionId;

  const [token, setToken] = useState<string | null>(null);
  const [submission, setSubmission] = useState<EnterpriseSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const initializedRef = useRef(false);

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
        router.push('/enterprise/workspace');
        return;
      }

      const json = await res.json();
      const sub: EnterpriseSubmission = json.submission;
      setSubmission(sub);

      if (sub.status === 'pending') {
        setSubmitted(true);
      }

      // Initialize the store from the submission's appMapJson (only once)
      if (!initializedRef.current && sub.app_map_json) {
        initializedRef.current = true;
        setAppMap(sub.app_map_json as AppMap);
      }

      setLoading(false);
    });
  }, [submissionId, router, setAppMap]);

  // Auto-save appMap changes back to the submission (debounced)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!token || !appMap || !submission || submitted) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await fetch(`/api/enterprise/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appMapJson: appMap }),
      });
    }, 2000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [appMap, token, submissionId, submission, submitted]);

  async function handleSubmitForReview() {
    if (!token || !appMap) return;
    setSubmitting(true);
    setSubmitError('');

    // Save latest app map first
    const saveRes = await fetch(`/api/enterprise/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ appMapJson: appMap, status: 'pending' }),
    });

    if (!saveRes.ok) {
      const json = await saveRes.json();
      setSubmitError(json.error ?? 'Failed to submit');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  const isReadOnly = submitted || submission?.status === 'approved' || submission?.status === 'live';

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/enterprise/workspace')}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            ← Back
          </button>
          <span className="text-zinc-700">|</span>
          <span className="text-white font-medium text-sm">
            {submission?.app_name ?? 'App Builder'}
          </span>
          {submission && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                submission.status === 'draft'
                  ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  : submission.status === 'pending'
                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  : submission.status === 'approved'
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

        <div className="flex items-center gap-3">
          {!submitted && !isReadOnly && (
            <>
              {submitError && (
                <span className="text-red-400 text-xs">{submitError}</span>
              )}
              <button
                onClick={handleSubmitForReview}
                disabled={submitting}
                className="px-4 py-2 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-100 transition-colors text-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit for IT Review'}
              </button>
            </>
          )}
          {submitted && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-xs font-medium">
                Submitted — waiting for IT review
              </span>
            </div>
          )}
          {submission?.status === 'approved' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="text-emerald-400 text-xs font-medium">Approved by IT</span>
            </div>
          )}
          {submission?.status === 'rejected' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="text-red-400 text-xs font-medium">Rejected by IT</span>
            </div>
          )}
        </div>
      </header>

      {/* Rejected banner */}
      {submission?.status === 'rejected' && submission.review_note && (
        <div className="shrink-0 border-b border-red-500/20 bg-red-500/5 px-6 py-3">
          <p className="text-red-400 text-sm">
            <span className="font-medium">Rejection reason: </span>
            {submission.review_note}
          </p>
          <p className="text-red-400/60 text-xs mt-0.5">
            Update your app and resubmit for review.
          </p>
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1 overflow-hidden">
        {appMap ? (
          <Canvas />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            No app map loaded
          </div>
        )}
      </div>
    </div>
  );
}
