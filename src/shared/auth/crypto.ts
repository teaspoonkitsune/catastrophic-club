import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

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

export function createRandomString(size = 32) {
  return toBase64Url(randomBytes(size));
}

export function createCodeChallenge(verifier: string) {
  return toBase64Url(createHash('sha256').update(verifier).digest());
}

function getEncryptionKey(secret: string) {
  return createHash('sha256').update(secret).digest();
}

export function encryptPayload(value: string, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted].map(toBase64Url).join('.');
}

export function decryptPayload(value: string, secret: string) {
  const [ivPart, authTagPart, encryptedPart] = value.split('.');

  if (!ivPart || !authTagPart || !encryptedPart) {
    throw new Error('Invalid encrypted payload');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(secret),
    fromBase64Url(ivPart),
  );

  decipher.setAuthTag(fromBase64Url(authTagPart));

  return Buffer.concat([
    decipher.update(fromBase64Url(encryptedPart)),
    decipher.final(),
  ]).toString('utf8');
}

