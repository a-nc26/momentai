'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Props = {
  onUnlocked: () => void | Promise<void>;
};

export default function BuildAccessGate({ onUnlocked }: Props) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tryDemo = () => {
    router.push('/app?demo=true');
  };

  const submit = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Enter your access code, or try the demo.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/build-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      if (res.ok) {
        await onUnlocked();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(
        typeof data?.error === 'string' ? data.error : 'That code is not valid. Try the demo below.'
      );
    } catch {
      setError('Could not verify — check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-y-auto bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Momentum</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Enter an invite code (from your team admin) to unlock the builder. Each code includes a
            pool of credits for AI map generation, builds, and edits. Or try the full demo
            for free.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Access code
          </label>
          <input
            type="password"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder="Your invite code"
            disabled={submitting}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white h-11 text-sm font-semibold rounded-xl transition-colors"
          >
            {submitting ? 'Checking…' : 'Unlock builder'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-zinc-950 px-3 text-zinc-600">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={tryDemo}
          className="w-full border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white h-11 text-sm font-medium rounded-xl transition-colors"
        >
          Try the Pulse demo
        </button>

        <p className="text-center text-zinc-600 text-xs">
          The demo includes the full canvas, runtime preview, and a canned edit flow — no API keys
          required.
        </p>

        <p className="text-center">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-xs">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
