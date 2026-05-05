'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OutOfBuilderCredits() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const enterAnotherCode = async () => {
    setBusy(true);
    try {
      await fetch('/api/build-access', { method: 'DELETE' });
      router.refresh();
      window.location.reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-y-auto bg-zinc-950">
      <div className="w-full max-w-md space-y-5 text-center">
        <h1 className="text-xl font-bold text-white">You&apos;re out of builder credits</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Redeem another invite code to keep generating and editing, or explore the Pulse demo with
          no usage limits (demo edit path is included).
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={enterAnotherCode}
            disabled={busy}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white h-11 text-sm font-semibold rounded-xl"
          >
            {busy ? '…' : 'Enter another code'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/app?demo=true')}
            className="w-full border border-zinc-700 hover:border-zinc-500 text-zinc-200 h-11 text-sm font-medium rounded-xl"
          >
            Try the Pulse demo
          </button>
        </div>
        <Link href="/" className="inline-block text-zinc-500 hover:text-zinc-300 text-xs">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
