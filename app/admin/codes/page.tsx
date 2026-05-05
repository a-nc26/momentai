'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type CodeRow = {
  id: string;
  code: string;
  label: string | null;
  credits_per_redeem: number;
  max_redemptions: number;
  redemption_count: number;
  expires_at: string | null;
  revoked: boolean;
  created_at: string;
};

export default function AdminCodesPage() {
  const [adminPin, setAdminPin] = useState('');
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: '',
    credits: 50,
    maxRedemptions: 1,
    expiresInDays: '' as string | number,
  });

  const adminHeaders = { 'X-Admin-Pin': adminPin.trim() };

  const load = useCallback(async () => {
    if (!adminPin.trim() || adminPin.length !== 4) {
      setError('Enter the 4-digit admin PIN (server env MOMENTAI_ADMIN_PIN)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/codes', { headers: adminHeaders });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed');
        return;
      }
      setCodes(data.codes ?? []);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [adminPin]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin.trim() || adminPin.length !== 4) {
      setError('Enter the 4-digit admin PIN');
      return;
    }
    setError('');
    setCreatedCode(null);
    setLoading(true);
    try {
      const expires = form.expiresInDays === '' ? null : Number(form.expiresInDays);
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({
          label: form.label || undefined,
          credits: form.credits,
          maxRedemptions: form.maxRedemptions,
          expiresInDays: expires == null || Number.isNaN(expires) || expires <= 0 ? null : expires,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Create failed');
        return;
      }
      if (typeof data.code === 'string') {
        setCreatedCode(data.code);
        load();
        setForm((f) => ({ ...f, label: '' }));
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (id: string) => {
    if (!adminPin.trim() || adminPin.length !== 4 || !confirm('Revoke this code? New redemptions will be blocked.'))
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/codes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      if (res.ok) load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-white">Builder invite codes</h1>
          <Link
            href="/admin/logs"
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Admin logs
          </Link>
        </div>

        <p className="text-sm text-zinc-500">
          Mint codes that grant credits per redemption. Set a 4-digit{' '}
          <code className="text-zinc-400">MOMENTAI_ADMIN_PIN</code> in server env (e.g.{' '}
          <code className="text-zinc-400">6379</code>
          ) and type it here. Optional: <code className="text-zinc-400">MOMENTAI_ADMIN_SECRET</code>{' '}
          still works for <code className="text-zinc-400">Authorization: Bearer</code> (automation). Run
          the SQL in <code className="text-zinc-400">supabase/migrations/…_builder_credits.sql</code>{' '}
          first.
        </p>

        <div className="space-y-2">
          <label className="text-xs text-zinc-500">4-digit admin PIN</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            className="w-40 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono tracking-widest"
            value={adminPin}
            onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
          />
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Load codes
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {createdCode && (
          <div className="rounded-lg border border-emerald-800 bg-emerald-950/30 px-4 py-3 text-sm">
            <p className="text-emerald-200 font-medium">New code (copy now — it won’t show again in full)</p>
            <p className="mt-1 font-mono text-white select-all break-all">{createdCode}</p>
          </div>
        )}

        <form onSubmit={create} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
          <p className="text-sm font-medium text-white">Create code</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500">Label (optional)</label>
              <input
                className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Credits per redemption</label>
              <input
                type="number"
                min={1}
                className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm"
                value={form.credits}
                onChange={(e) => setForm((f) => ({ ...f, credits: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Max redemptions</label>
              <input
                type="number"
                min={1}
                className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm"
                value={form.maxRedemptions}
                onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Expires in (days, blank = never)</label>
              <input
                type="number"
                min={1}
                className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm"
                value={form.expiresInDays}
                onChange={(e) => setForm((f) => ({ ...f, expiresInDays: e.target.value }))}
                placeholder="optional"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
          >
            Create
          </button>
        </form>

        <div className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-400">All codes</h2>
          {codes.length === 0 && !loading && <p className="text-sm text-zinc-600">No rows yet.</p>}
          <ul className="space-y-2">
            {codes.map((c) => (
              <li
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-mono text-white">{c.code}</span>
                  {c.label && <span className="text-zinc-500 ml-2">{c.label}</span>}
                  {c.revoked && <span className="text-red-400 ml-2">revoked</span>}
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {c.credits_per_redeem} cr · {c.redemption_count}/{c.max_redemptions} uses
                    {c.expires_at && ` · exp ${new Date(c.expires_at).toLocaleDateString()}`}
                  </div>
                </div>
                {!c.revoked && (
                  <button
                    type="button"
                    onClick={() => revoke(c.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
