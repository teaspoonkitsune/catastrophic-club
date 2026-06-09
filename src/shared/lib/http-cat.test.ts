import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HttpCatError,
  createHttpCatErrorPayload,
  getHttpCatUrl,
  normalizeHttpStatus,
  toHttpCatError,
} from './http-cat';

test('normalizeHttpStatus falls back for invalid values', () => {
  assert.equal(normalizeHttpStatus(), 500);
  assert.equal(normalizeHttpStatus(99), 500);
  assert.equal(normalizeHttpStatus(600), 500);
});

test('normalizeHttpStatus preserves valid HTTP status codes', () => {
  assert.equal(normalizeHttpStatus(200), 200);
  assert.equal(normalizeHttpStatus(503), 503);
});

test('createHttpCatErrorPayload normalizes status and builds image URL', () => {
  assert.deepEqual(createHttpCatErrorPayload(700, 'Boom'), {
    error: 'Boom',
    status: 500,
    catImageUrl: 'https://http.cat/500.jpg',
  });
});

test('HttpCatError derives message and cat image URL', () => {
  const error = new HttpCatError({ status: 404 });

  assert.equal(error.message, 'Request failed with status 404');
  assert.equal(error.status, 404);
  assert.equal(error.catImageUrl, getHttpCatUrl(404));
});

test('toHttpCatError preserves existing HttpCatError instances', () => {
  const original = new HttpCatError({ error: 'Nope', status: 401 });

  assert.equal(toHttpCatError(original), original);
});

test('toHttpCatError wraps normal errors and unknown values', () => {
  const wrapped = toHttpCatError(new Error('Broken'), 422);
  assert.equal(wrapped.message, 'Broken');
  assert.equal(wrapped.status, 422);

  const fallback = toHttpCatError('unexpected', 418);
  assert.equal(fallback.message, 'Unexpected error');
  assert.equal(fallback.status, 418);
});
