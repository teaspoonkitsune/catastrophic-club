import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeRateLimit } from './rate-limit';

const originalDateNow = Date.now;

function withMockedNow(value: number) {
  Date.now = () => value;
}

test.afterEach(() => {
  Date.now = originalDateNow;
});

test('consumeRateLimit allows requests until the limit is reached', () => {
  withMockedNow(1_000);
  const key = `limit-${Math.random()}`;

  const first = consumeRateLimit({ key, limit: 2, windowMs: 30_000 });
  const second = consumeRateLimit({ key, limit: 2, windowMs: 30_000 });
  const third = consumeRateLimit({ key, limit: 2, windowMs: 30_000 });

  assert.deepEqual(first, {
    success: true,
    remaining: 1,
    retryAfterSeconds: 30,
  });
  assert.deepEqual(second, {
    success: true,
    remaining: 0,
    retryAfterSeconds: 30,
  });
  assert.deepEqual(third, {
    success: false,
    remaining: 0,
    retryAfterSeconds: 30,
  });
});

test('consumeRateLimit resets usage after the window expires', () => {
  const key = `reset-${Math.random()}`;

  withMockedNow(2_000);
  consumeRateLimit({ key, limit: 1, windowMs: 10_000 });
  const blocked = consumeRateLimit({ key, limit: 1, windowMs: 10_000 });
  assert.equal(blocked.success, false);

  withMockedNow(12_001);
  const reset = consumeRateLimit({ key, limit: 1, windowMs: 10_000 });

  assert.deepEqual(reset, {
    success: true,
    remaining: 0,
    retryAfterSeconds: 10,
  });
});
