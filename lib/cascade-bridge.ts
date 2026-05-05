import type { CascadeDecision } from '@/lib/store';

/**
 * Holds the in-flight cascade resolver so the CascadeReviewPanel can resolve the
 * hook's awaiting promise without bubbling a resolver through the store's JSON state.
 * Keyed by pendingCascade.id to prevent stale resolvers from firing if a second
 * edit starts before the first drawer closes (shouldn't happen, but cheap to guard).
 */
const resolvers = new Map<string, (decision: CascadeDecision) => void>();

export function registerCascadeResolver(
  id: string,
  resolver: (decision: CascadeDecision) => void
) {
  resolvers.set(id, resolver);
}

export function resolveCascade(id: string, decision: CascadeDecision) {
  const resolver = resolvers.get(id);
  if (resolver) {
    resolver(decision);
    resolvers.delete(id);
  }
}

export function clearCascadeResolver(id: string) {
  resolvers.delete(id);
}
