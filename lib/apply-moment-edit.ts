import type { AppMap, FlowEdge, Journey, Moment } from '@/lib/types';
import { resolveDemoEditMoment, resolveDemoPropagateBatch } from '@/lib/demo-edit';

/** Drops bulky fields from non-edited moments; server only needs their ids/labels for nav digests. */
export function slimAppMapForEdit(appMap: AppMap, editedMomentId: string): AppMap {
  return {
    ...appMap,
    moments: appMap.moments.map((m) =>
      m.id === editedMomentId
        ? m
        : { ...m, componentCode: undefined, mockHtml: undefined }
    ),
  };
}

export type EditMomentSuccess = {
  ok: true;
  componentCode: string;
  metadata?: Partial<Pick<Moment, 'label' | 'description' | 'preview' | 'screenSpec'>>;
  affectedMoments?: Record<string, string>;
};

export type EditMomentFailure = {
  ok: false;
  error: string;
  code?: string;
  retryable?: boolean;
  suggestion?: string;
};

export type EditMomentResult = EditMomentSuccess | EditMomentFailure;

export async function requestEditMoment(params: {
  moment: Moment;
  change: string;
  journey: Journey;
  appMap: AppMap;
  signal?: AbortSignal;
  /** When true (default), strips other moments' componentCode/mockHtml to shrink the payload. */
  slimAppMap?: boolean;
}): Promise<EditMomentResult> {
  const { slimAppMap = true, signal, ...rest } = params;
  const demoResult = resolveDemoEditMoment({ appMap: rest.appMap, moment: rest.moment });
  if (demoResult !== null) return demoResult;

  const body = {
    ...rest,
    appMap: slimAppMap ? slimAppMapForEdit(rest.appMap, rest.moment.id) : rest.appMap,
  };
  const res = await fetch('/api/edit-moment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  let data: {
    error?: string;
    code?: string;
    retryable?: boolean;
    suggestion?: string;
    componentCode?: string;
    metadata?: Partial<Pick<Moment, 'label' | 'description' | 'preview' | 'screenSpec'>>;
    affectedMoments?: Record<string, string>;
  };
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: 'Invalid response from server' };
  }
  if (!res.ok) {
    return {
      ok: false,
      error: typeof data.error === 'string' ? data.error : 'Edit failed',
      code: typeof data.code === 'string' ? data.code : undefined,
      retryable: typeof data.retryable === 'boolean' ? data.retryable : undefined,
      suggestion: typeof data.suggestion === 'string' ? data.suggestion : undefined,
    };
  }
  const componentCode =
    typeof data.componentCode === 'string' && data.componentCode.length > 0
      ? data.componentCode
      : '';
  if (!componentCode) {
    return { ok: false, error: 'No component code returned' };
  }
  return {
    ok: true,
    componentCode,
    metadata: data.metadata,
    affectedMoments: data.affectedMoments,
  };
}

export type PropagateBatchBody = {
  items: { moment: Moment; reason: string }[];
  editChange: string;
  editedMoment: Moment;
  journey: Journey;
  appMap: AppMap;
};

export type PropagateBatchResult = {
  updates: Record<string, Partial<Moment> & { mockHtml?: null }>;
  additions?: {
    moments: Moment[];
    edges: FlowEdge[];
  };
  errors?: Record<string, string>;
};

export async function requestPropagateBatch(
  body: PropagateBatchBody,
  signal?: AbortSignal
): Promise<PropagateBatchResult> {
  const demoResult = resolveDemoPropagateBatch(body);
  if (demoResult) return demoResult;

  const res = await fetch('/api/propagate-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  let data: {
    updates?: PropagateBatchResult['updates'];
    additions?: PropagateBatchResult['additions'];
    errors?: Record<string, string>;
  };
  try {
    data = await res.json();
  } catch {
    return { updates: {}, errors: { _: 'Invalid response from propagation' } };
  }
  if (!res.ok) {
    return {
      updates: data.updates ?? {},
      additions: data.additions,
      errors: { _: typeof data === 'object' && data && 'error' in data ? String((data as { error?: string }).error) : 'Propagation failed' },
    };
  }
  return {
    updates: data.updates ?? {},
    additions: data.additions,
    errors: data.errors,
  };
}
