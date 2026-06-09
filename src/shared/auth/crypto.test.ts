import test from 'node:test';
import assert from 'node:assert/strict';
import { decryptPayload, encryptPayload } from './crypto';

test('encrypted payload can be decrypted with the same secret', () => {
  const encrypted = encryptPayload(JSON.stringify({ role: 'cat-admin' }), 'secret-key');

  assert.equal(decryptPayload(encrypted, 'secret-key'), '{"role":"cat-admin"}');
});

test('decryptPayload rejects malformed payloads', () => {
  assert.throws(() => decryptPayload('broken', 'secret-key'), /Invalid encrypted payload/);
});

test('decryptPayload rejects tampered ciphertext or the wrong secret', () => {
  const encrypted = encryptPayload('meow', 'secret-key');
  const tampered = `${encrypted.slice(0, -1)}${encrypted.endsWith('a') ? 'b' : 'a'}`;

  assert.throws(() => decryptPayload(encrypted, 'wrong-secret'));
  assert.throws(() => decryptPayload(tampered, 'secret-key'));
});
