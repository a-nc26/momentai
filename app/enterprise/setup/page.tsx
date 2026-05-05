'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEnterpriseSupabaseClient } from '@/lib/enterprise/auth';

export default function EnterpriseSetupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleEmailChange(value: string) {
    setEmail(value);
    const atIndex = value.indexOf('@');
    if (atIndex !== -1) {
      const domain = value.slice(atIndex + 1);
      if (domain && domain.includes('.')) {
        setCompanyDomain(domain);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/enterprise/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, companyName, companyDomain }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Setup failed');
        return;
      }

      // Sign in with the newly created credentials
      const supabase = createEnterpriseSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Account created but sign-in failed. Please sign in manually.');
        router.push('/enterprise');
        return;
      }

      router.push('/enterprise/admin');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <button
            onClick={() => router.push('/enterprise')}
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors mb-6 flex items-center gap-1"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-zinc-950 rounded-sm" />
            </div>
            <span className="text-white font-semibold tracking-tight">Momentum Enterprise</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Set up your workspace</h1>
          <p className="text-zinc-400 text-sm">
            You will be the IT admin for your company workspace.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
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
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
              />
            </div>
            <div className="pt-2 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">
                Company details
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Company domain
                  </label>
                  <input
                    type="text"
                    value={companyDomain}
                    onChange={(e) => setCompanyDomain(e.target.value)}
                    placeholder="acme.com"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition"
                  />
                  <p className="text-xs text-zinc-600 mt-1">
                    Auto-filled from your email. All users with this domain can join.
                  </p>
                </div>
              </div>
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
              {loading ? 'Creating workspace...' : 'Create workspace'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-sm mt-6">
          Already have a workspace?{' '}
          <button
            onClick={() => router.push('/enterprise')}
            className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
