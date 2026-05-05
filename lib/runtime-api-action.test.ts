import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyApiActionResultToSession,
  buildRuntimeApiActionPayload,
  type RuntimeSessionState,
} from '@/lib/runtime';
import type { RuntimeActionSpec } from '@/lib/types';

test('buildRuntimeApiActionPayload resolves templates locally without model calls', () => {
  const action: RuntimeActionSpec = {
    id: 'save-workout',
    label: 'Save',
    kind: 'api-call',
    operation: 'upsert_record',
    namespace: 'workouts',
    keyTemplate: 'workout-{{workoutType}}',
    valueTemplate: { type: '{{workoutType}}', minutes: '{{minutes}}' },
    resultKey: 'savedWorkout',
  };

  const payload = buildRuntimeApiActionPayload(action, {
    workoutType: 'cardio',
    minutes: 30,
  });

  assert.deepEqual(payload, {
    operation: 'upsert_record',
    namespace: 'workouts',
    key: 'workout-cardio',
    value: { type: 'cardio', minutes: '30' },
    resultKey: 'savedWorkout',
    nextValues: { workoutType: 'cardio', minutes: 30 },
  });
});

test('applyApiActionResultToSession merges patch and navigates after success', () => {
  const session: RuntimeSessionState = {
    currentMomentId: 'edit',
    history: [],
    values: { workoutType: 'cardio' },
  };
  const action: RuntimeActionSpec = {
    id: 'save',
    label: 'Save',
    kind: 'api-call',
    operation: 'upsert_record',
    keyTemplate: 'profile',
    target: 'dashboard',
  };

  const next = applyApiActionResultToSession(
    session,
    action,
    session.values,
    { saved: true }
  );

  assert.equal(next.currentMomentId, 'dashboard');
  assert.deepEqual(next.history, ['edit']);
  assert.deepEqual(next.values, { workoutType: 'cardio', saved: true });
});
