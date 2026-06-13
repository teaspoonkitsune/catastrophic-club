import test from 'node:test';
import assert from 'node:assert/strict';
import { decryptPayload, encryptPayload } from './crypto';

function toBase64Url(value: Buffer) {
  return value
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));

  return Buffer.from(normalized + padding, 'base64');
}

test('encrypted payload can be decrypted with the same secret', () => {
  const encrypted = encryptPayload(JSON.stringify({ role: 'cat-admin' }), 'secret-key');

  assert.equal(decryptPayload(encrypted, 'secret-key'), '{"role":"cat-admin"}');
});

test('decryptPayload rejects malformed payloads', () => {
  assert.throws(() => decryptPayload('broken', 'secret-key'), /Invalid encrypted payload/);
});

test('decryptPayload rejects tampered ciphertext or the wrong secret', () => {
  const encrypted = encryptPayload('meow', 'secret-key');
  const [ivPart, authTagPart, encryptedPart] = encrypted.split('.');
  const tamperedAuthTag = fromBase64Url(authTagPart);
  tamperedAuthTag[0] ^= 0xff;
  const tampered = [ivPart, toBase64Url(tamperedAuthTag), encryptedPart].join('.');

  assert.throws(() => decryptPayload(encrypted, 'wrong-secret'));
  assert.throws(() => decryptPayload(tampered, 'secret-key'));
});
