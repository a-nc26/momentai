'use client';

import { useEffect, useRef, useCallback } from 'react';

// Generates or retrieves a stable session ID for this browser
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  const key = 'momentai_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

interface UseSessionOptions {
  projectId: string | null;
  onStateLoaded: (state: Record<string, unknown>) => void;
}

export function useSession({ projectId, onStateLoaded }: UseSessionOptions) {
  const sessionId = useRef<string>(getOrCreateSessionId());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSynced = useRef(false);

  // Load state from DB on mount (once per projectId)
  useEffect(() => {
    if (!projectId) return;
    hasSynced.current = false;

    fetch(`/api/session?projectId=${encodeURIComponent(projectId)}&sessionId=${encodeURIComponent(sessionId.current)}`)
      .then((r) => r.json())
      .then(({ state }) => {
        if (state && typeof state === 'object' && !hasSynced.current) {
          hasSynced.current = true;
          onStateLoaded(state as Record<string, unknown>);
        }
      })
      .catch(() => {});
  }, [projectId]);

  // Debounced save — fires 600ms after last state change
  const saveState = useCallback(
    (state: Record<string, unknown>) => {
      if (!projectId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, sessionId: sessionId.current, state }),
        }).catch(() => {});
      }, 600);
    },
    [projectId],
  );

  return { saveState, sessionId: sessionId.current };
}
