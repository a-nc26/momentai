import type { AppMap, RuntimeBackendOperation, RuntimeValue } from '@/lib/types';
import { getSupabaseBuilder } from '@/lib/supabase';
import {
  createGuestId,
  generatePublishToken,
  hashPublishToken,
  verifyPublishToken,
} from '@/lib/publish-token';

export interface RuntimeIdentity {
  appId: string;
  publishToken: string;
  guestId?: string;
}

export interface RuntimeActionRequest extends RuntimeIdentity {
  operation: RuntimeBackendOperation;
  namespace?: string;
  key: string;
  value?: RuntimeValue;
  resultKey?: string;
}

export interface RuntimeActionResult {
  statePatch: Record<string, RuntimeValue>;
  value?: RuntimeValue;
}

type GeneratedAppRow = {
  id: string;
  name: string;
  app_map_json: AppMap;
  publish_token_hash: string;
  token_version: number;
};

function appMapForStorage(appMap: AppMap): AppMap {
  if (!appMap.backend) return appMap;
  return {
    ...appMap,
    backend: {
      appId: appMap.backend.appId,
      tokenVersion: appMap.backend.tokenVersion,
    },
  };
}

function requireNonEmpty(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function isRuntimeOperation(value: unknown): value is RuntimeBackendOperation {
  return value === 'upsert_record' || value === 'append_record' || value === 'read_record';
}

export async function validateRuntimeIdentity(identity: RuntimeIdentity): Promise<GeneratedAppRow> {
  const appId = requireNonEmpty(identity.appId, 'appId');
  const publishToken = requireNonEmpty(identity.publishToken, 'publishToken');

  const supabase = getSupabaseBuilder();
  const { data, error } = await supabase
    .from('generated_apps')
    .select('id,name,app_map_json,publish_token_hash,token_version')
    .eq('id', appId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Generated app not found');
  }

  const row = data as GeneratedAppRow;
  if (!verifyPublishToken(publishToken, row.publish_token_hash)) {
    throw new Error('Invalid publish token');
  }

  return row;
}

export async function createRuntimeSession(identity: RuntimeIdentity) {
  const app = await validateRuntimeIdentity(identity);
  return {
    appId: app.id,
    guestId: identity.guestId || createGuestId(),
    tokenVersion: app.token_version,
  };
}

export async function getPublishedRuntimeApp(identity: RuntimeIdentity): Promise<AppMap> {
  const app = await validateRuntimeIdentity(identity);
  return {
    ...app.app_map_json,
    backend: {
      appId: app.id,
      publishToken: identity.publishToken,
      tokenVersion: app.token_version,
    },
  };
}

export function buildRuntimeStatePatch(
  operation: RuntimeBackendOperation,
  key: string,
  value: RuntimeValue | undefined,
  resultKey?: string
): Record<string, RuntimeValue> {
  const patchKey = resultKey || key;
  if (operation === 'read_record' && value === undefined) return {};
  if (operation === 'append_record') {
    return { [patchKey]: Array.isArray(value) ? value : value === undefined ? [] : [value] };
  }
  return { [patchKey]: (value ?? null) as RuntimeValue };
}

export async function executeRuntimeAction(
  request: RuntimeActionRequest
): Promise<RuntimeActionResult> {
  if (!isRuntimeOperation(request.operation)) {
    throw new Error('Invalid runtime operation');
  }
  const app = await validateRuntimeIdentity(request);
  const guestId = requireNonEmpty(request.guestId, 'guestId');
  const namespace = request.namespace?.trim() || 'default';
  const key = requireNonEmpty(request.key, 'key');
  const supabase = getSupabaseBuilder();

  if (request.operation === 'read_record') {
    const { data, error } = await supabase
      .from('app_records')
      .select('value_json')
      .eq('app_id', app.id)
      .eq('guest_id', guestId)
      .eq('namespace', namespace)
      .eq('key', key)
      .maybeSingle();

    if (error) throw new Error(error.message);
    const value = data?.value_json as RuntimeValue | undefined;
    return { value, statePatch: buildRuntimeStatePatch('read_record', key, value, request.resultKey) };
  }

  if (request.operation === 'append_record') {
    const { data, error } = await supabase
      .from('app_records')
      .select('value_json')
      .eq('app_id', app.id)
      .eq('guest_id', guestId)
      .eq('namespace', namespace)
      .eq('key', key)
      .maybeSingle();

    if (error) throw new Error(error.message);
    const current = Array.isArray(data?.value_json) ? [...(data.value_json as RuntimeValue[])] : [];
    current.push((request.value ?? null) as RuntimeValue);

    const { error: writeError } = await supabase.from('app_records').upsert(
      {
        app_id: app.id,
        guest_id: guestId,
        namespace,
        key,
        value_json: current,
      },
      { onConflict: 'app_id,guest_id,namespace,key' }
    );
    if (writeError) throw new Error(writeError.message);

    return {
      value: current as RuntimeValue,
      statePatch: buildRuntimeStatePatch('append_record', key, current as RuntimeValue, request.resultKey),
    };
  }

  const value = (request.value ?? null) as RuntimeValue;
  const { error } = await supabase.from('app_records').upsert(
    {
      app_id: app.id,
      guest_id: guestId,
      namespace,
      key,
      value_json: value,
    },
    { onConflict: 'app_id,guest_id,namespace,key' }
  );
  if (error) throw new Error(error.message);

  return {
    value,
    statePatch: buildRuntimeStatePatch('upsert_record', key, value, request.resultKey),
  };
}

export async function loadRuntimeState(identity: RuntimeIdentity): Promise<Record<string, RuntimeValue>> {
  const app = await validateRuntimeIdentity(identity);
  const guestId = requireNonEmpty(identity.guestId, 'guestId');

  const { data, error } = await getSupabaseBuilder()
    .from('app_records')
    .select('key,value_json')
    .eq('app_id', app.id)
    .eq('guest_id', guestId);

  if (error) throw new Error(error.message);

  const state: Record<string, RuntimeValue> = {};
  for (const row of data ?? []) {
    state[String(row.key)] = row.value_json as RuntimeValue;
  }
  return state;
}

export async function publishGeneratedApp(appMap: AppMap) {
  if (appMap.backend?.appId && appMap.backend.publishToken) {
    const app = await validateRuntimeIdentity({
      appId: appMap.backend.appId,
      publishToken: appMap.backend.publishToken,
    });
    const { error } = await getSupabaseBuilder()
      .from('generated_apps')
      .update({
        name: appMap.appName,
        app_map_json: appMapForStorage({
          ...appMap,
          backend: { appId: app.id, tokenVersion: app.token_version },
        }),
      })
      .eq('id', app.id);
    if (error) throw new Error(error.message);
    return {
      appId: app.id,
      publishToken: appMap.backend.publishToken,
      tokenVersion: app.token_version,
    };
  }

  const publishToken = generatePublishToken();
  const { data, error } = await getSupabaseBuilder()
    .from('generated_apps')
    .insert({
      name: appMap.appName,
      app_map_json: appMapForStorage(appMap),
      publish_token_hash: hashPublishToken(publishToken),
    })
    .select('id,token_version')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to publish app');

  return {
    appId: String(data.id),
    publishToken,
    tokenVersion: Number(data.token_version ?? 1),
  };
}

export async function rotatePublishToken(identity: RuntimeIdentity) {
  const app = await validateRuntimeIdentity(identity);
  const publishToken = generatePublishToken();
  const tokenVersion = app.token_version + 1;

  const { error } = await getSupabaseBuilder()
    .from('generated_apps')
    .update({
      publish_token_hash: hashPublishToken(publishToken),
      token_version: tokenVersion,
    })
    .eq('id', app.id);

  if (error) throw new Error(error.message);

  return {
    appId: app.id,
    publishToken,
    tokenVersion,
  };
}
