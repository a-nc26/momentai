import type { AppMap, RuntimeValue } from '@/lib/types';
import type { RuntimeApiActionPayload } from '@/lib/runtime';

function guestStorageKey(appId: string) {
  return `momentai_runtime_guest_${appId}`;
}

export function getStoredRuntimeGuestId(appId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(guestStorageKey(appId));
}

export function storeRuntimeGuestId(appId: string, guestId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(guestStorageKey(appId), guestId);
}

export function getRuntimeBackend(appMap: AppMap | null | undefined) {
  if (!appMap?.backend?.appId || !appMap.backend.publishToken) return null;
  return {
    appId: appMap.backend.appId,
    publishToken: appMap.backend.publishToken,
  };
}

export async function ensureRuntimeSession(appMap: AppMap): Promise<string | null> {
  const backend = getRuntimeBackend(appMap);
  if (!backend) return null;

  const storedGuestId = getStoredRuntimeGuestId(backend.appId);
  const res = await fetch('/api/runtime/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...backend, guestId: storedGuestId }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Runtime session failed');
  const data = (await res.json()) as { guestId: string };
  storeRuntimeGuestId(backend.appId, data.guestId);
  return data.guestId;
}

export async function loadPublishedRuntimeState(
  appMap: AppMap,
  guestId: string
): Promise<Record<string, RuntimeValue>> {
  const backend = getRuntimeBackend(appMap);
  if (!backend) return {};

  const params = new URLSearchParams({
    appId: backend.appId,
    publishToken: backend.publishToken,
    guestId,
  });
  const res = await fetch(`/api/runtime/state?${params.toString()}`);
  if (!res.ok) throw new Error((await res.json()).error ?? 'Runtime state failed');
  const data = (await res.json()) as { state?: Record<string, RuntimeValue> };
  return data.state ?? {};
}

export async function executePublishedRuntimeAction(
  appMap: AppMap,
  guestId: string,
  payload: RuntimeApiActionPayload
): Promise<Record<string, RuntimeValue>> {
  const backend = getRuntimeBackend(appMap);
  if (!backend) throw new Error('Published backend is not configured for this app');

  const res = await fetch('/api/runtime/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...backend,
      guestId,
      operation: payload.operation,
      namespace: payload.namespace,
      key: payload.key,
      value: payload.value,
      resultKey: payload.resultKey,
    }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Runtime action failed');
  const data = (await res.json()) as { statePatch?: Record<string, RuntimeValue> };
  return data.statePatch ?? {};
}
