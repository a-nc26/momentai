'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';

type Totals = {
  events: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd_estimate: number;
};

type UsageApiPayload = {
  totals: {
    all: Totals;
    last_24h: Totals;
    last_30d: Totals;
  };
  byEventType: Record<string, { events: number; total_tokens: number; cost: number }>;
  events: Array<{
    id: string;
    created_at: string;
    event_type: string;
    status: string;
    route: string | null;
    model: string | null;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost_usd_estimate: number;
    metadata: Record<string, unknown> | null;
  }>;
};

function fmtInt(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString();
}

function fmtUsd(n: number | null | undefined): string {
  return `$${(n ?? 0).toFixed(4)}`;
}

export default function AdminUsagePage() {
  const [adminPin, setAdminPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<UsageApiPayload | null>(null);

  const load = useCallback(async () => {
    if (!adminPin.trim() || adminPin.length !== 4) {
      setError('Enter the 4-digit admin PIN (server env MOMENTAI_ADMIN_PIN)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/usage', { headers: { 'X-Admin-Pin': adminPin.trim() } });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Request failed');
        return;
      }
      setData(body as UsageApiPayload);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [adminPin]);

  const eventTypes = useMemo(() => {
    if (!data?.byEventType) return [];
    return Object.entries(data.byEventType).sort((a, b) => b[1].events - a[1].events);
  }, [data]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-white">Usage dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/codes" className="text-xs text-zinc-500 hover:text-zinc-300">
              Admin codes
            </Link>
            <Link href="/admin/logs" className="text-xs text-zinc-500 hover:text-zinc-300">
              Admin logs
            </Link>
          </div>
        </div>

        <p className="text-sm text-zinc-500">
          Tracks server-side usage events (tokens + estimated cost where available) from generation/build routes.
          Use this to monitor activity and spend over time.
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
            Load usage
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SummaryCard title="Last 24h" totals={data.totals.last_24h} />
              <SummaryCard title="Last 30d" totals={data.totals.last_30d} />
              <SummaryCard title="All captured" totals={data.totals.all} />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
              <p className="text-sm font-medium text-white">By event type</p>
              {eventTypes.length === 0 ? (
                <p className="text-sm text-zinc-600">No usage rows yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {eventTypes.map(([name, stats]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between text-xs border border-zinc-800 rounded-lg px-3 py-2"
                    >
                      <span className="font-mono text-zinc-300">{name}</span>
                      <span className="text-zinc-500">
                        {fmtInt(stats.events)} events · {fmtInt(stats.total_tokens)} tokens · {fmtUsd(stats.cost)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
              <p className="text-sm font-medium text-white">Recent events</p>
              {data.events.length === 0 ? (
                <p className="text-sm text-zinc-600">No rows yet.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="text-zinc-500">
                      <tr className="text-left border-b border-zinc-800">
                        <th className="py-2 pr-3">Time</th>
                        <th className="py-2 pr-3">Event</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2 pr-3">Tokens</th>
                        <th className="py-2 pr-3">Cost (est.)</th>
                        <th className="py-2 pr-3">Model</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.events.map((e) => (
                        <tr key={e.id} className="border-b border-zinc-900">
                          <td className="py-2 pr-3 text-zinc-500">{new Date(e.created_at).toLocaleString()}</td>
                          <td className="py-2 pr-3 font-mono text-zinc-300">{e.event_type}</td>
                          <td className={`py-2 pr-3 ${e.status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {e.status}
                          </td>
                          <td className="py-2 pr-3 text-zinc-400">{fmtInt(e.total_tokens)}</td>
                          <td className="py-2 pr-3 text-zinc-400">{fmtUsd(e.cost_usd_estimate)}</td>
                          <td className="py-2 pr-3 text-zinc-500">{e.model ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, totals }: { title: string; totals: Totals }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{title}</p>
      <p className="mt-2 text-sm text-zinc-300">{fmtInt(totals.events)} events</p>
      <p className="text-sm text-zinc-300">{fmtInt(totals.total_tokens)} tokens</p>
      <p className="text-sm text-emerald-300">{fmtUsd(totals.cost_usd_estimate)} est.</p>
    </div>
  );
}
