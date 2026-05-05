import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createGuestId,
  generatePublishToken,
  hashPublishToken,
  verifyPublishToken,
} from '@/lib/publish-token';

test('publish tokens verify against stored hashes only', () => {
  const token = generatePublishToken();
  const hash = hashPublishToken(token);

  assert.match(token, /^mom_/);
  assert.notEqual(hash, token);
  assert.equal(verifyPublishToken(token, hash), true);
  assert.equal(verifyPublishToken(`${token}x`, hash), false);
});

test('guest ids are prefixed and unique', () => {
  const a = createGuestId();
  const b = createGuestId();

  assert.match(a, /^guest_/);
  assert.notEqual(a, b);
});
