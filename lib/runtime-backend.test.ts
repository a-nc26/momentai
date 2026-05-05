import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRuntimeStatePatch } from '@/lib/runtime-backend';

test('runtime state patch maps operation results to resultKey', () => {
  assert.deepEqual(
    buildRuntimeStatePatch('upsert_record', 'profile', { name: 'Avi' }, 'savedProfile'),
    { savedProfile: { name: 'Avi' } }
  );
});

test('append_record patch always returns an array', () => {
  assert.deepEqual(buildRuntimeStatePatch('append_record', 'logs', 'Run'), {
    logs: ['Run'],
  });
});

test('read_record with missing value returns no patch', () => {
  assert.deepEqual(buildRuntimeStatePatch('read_record', 'missing', undefined), {});
});
