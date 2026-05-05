import assert from 'node:assert/strict';
import test from 'node:test';
import type { AppMap } from '@/lib/types';
import {
  formatUpstreamStateBindingInstructions,
  getUpstreamWrittenStateKeys,
} from '@/lib/upstream-state-keys';

function buildFixture(): AppMap {
  return {
    appName: 'Debate',
    appDescription: 'Test',
    journeys: [{ id: 'j1', name: 'Onboarding', description: 'x' }],
    stateSchema: [
      {
        key: 'selectedInterests',
        label: 'Interests',
        type: 'string[]',
        defaultValue: [],
      },
    ],
    initialState: { selectedInterests: [] },
    moments: [
      {
        id: 'choose-interests',
        journeyId: 'j1',
        label: 'Choose Interests',
        description: 'Pick',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 0 },
        screenSpec: {
          title: 'Interests',
          components: [
            {
              id: 'c1',
              type: 'chip-group',
              key: 'selectedInterests',
              label: 'Topics',
              selection: 'multiple',
              options: [{ value: 'politics', label: 'Politics' }],
            },
          ],
          actions: [{ id: 'a1', label: 'Continue', kind: 'navigate', style: 'primary', target: 'onboarding-complete' }],
        },
      },
      {
        id: 'onboarding-complete',
        journeyId: 'j1',
        label: 'Onboarding Complete',
        description: 'Recap',
        type: 'ui',
        preview: '',
        position: { x: 280, y: 0 },
        screenSpec: {
          title: 'Done',
          components: [{ id: 's1', type: 'notice', tone: 'success', title: 'Ready' }],
          actions: [],
        },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'choose-interests',
        target: 'onboarding-complete',
        label: 'Continue',
      },
    ],
  };
}

test('getUpstreamWrittenStateKeys picks component keys from edge sources', () => {
  const appMap = buildFixture();
  assert.deepEqual(getUpstreamWrittenStateKeys('choose-interests', appMap), []);
  assert.deepEqual(getUpstreamWrittenStateKeys('onboarding-complete', appMap), ['selectedInterests']);
});

test('getUpstreamWrittenStateKeys unions dataFlow.stateChanges', () => {
  const appMap = buildFixture();
  appMap.edges[0].dataFlow = { stateChanges: ['extraFlag'] };
  assert.deepEqual(getUpstreamWrittenStateKeys('onboarding-complete', appMap).sort(), ['extraFlag', 'selectedInterests']);
});

test('formatUpstreamStateBindingInstructions includes key and forbids fabricated picks', () => {
  const appMap = buildFixture();
  const text = formatUpstreamStateBindingInstructions(['selectedInterests'], appMap);
  assert.match(text, /UPSTREAM STATE — USER SET THESE ON PRIOR SCREENS/);
  assert.match(text, /selectedInterests/);
  assert.match(text, /Never swap in unrelated demo labels/);
});
