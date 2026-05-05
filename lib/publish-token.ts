import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const TOKEN_BYTES = 32;

export function generatePublishToken(): string {
  return `mom_${randomBytes(TOKEN_BYTES).toString('base64url')}`;
}

export function hashPublishToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function verifyPublishToken(token: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashPublishToken(token), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function createGuestId(): string {
  return `guest_${randomBytes(16).toString('base64url')}`;
}
