'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEnterpriseSupabaseClient } from '@/lib/enterprise/auth';

export default function EnterpriseLandingPage() {
  const router = useRouter();
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createEnterpriseSupabaseClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        setError(authError?.message ?? 'Sign in failed');
        return;
      }

      router.push('/enterprise/workspace');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Wordmark */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <div className="w-4 h-4 bg-zinc-950 rounded-sm" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Momentum</span>
            <span className="text-xs text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5 font-medium">
              Enterprise
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Momentum for Enterprise
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            The structured AI app builder with IT governance built in.
          </p>
        </div>

        {!showSignIn ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowSignIn(true)}
              className="w-full py-3 px-4 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/enterprise/setup')}
              className="w-full py-3 px-4 bg-zinc-900 text-white font-semibold rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
            >
              Set up your workspace
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-white font-semibold text-lg mb-5">Sign in to your workspace</h2>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Work email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <button
              onClick={() => setShowSignIn(false)}
              className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Back
            </button>
          </div>
        )}

        <p className="text-center text-zinc-600 text-sm mt-8">
          Need a workspace?{' '}
          <button
            onClick={() => router.push('/enterprise/setup')}
            className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
          >
            Set one up
          </button>
        </p>
      </div>
    </div>
  );
}
