import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAuthHref, sanitizeReturnTo } from './links';

test('buildAuthHref keeps returnTo in query params', () => {
  assert.equal(buildAuthHref('logout', '/favorites'), '/api/auth/logout?returnTo=%2Ffavorites');
});

test('sanitizeReturnTo blocks open redirect style values', () => {
  assert.equal(sanitizeReturnTo(null), '/');
  assert.equal(sanitizeReturnTo('https://evil.example'), '/');
  assert.equal(sanitizeReturnTo('//evil.example'), '/');
  assert.equal(sanitizeReturnTo('javascript:alert(1)'), '/');
});

test('sanitizeReturnTo preserves safe in-app paths', () => {
  assert.equal(sanitizeReturnTo('/favorites'), '/favorites');
  assert.equal(sanitizeReturnTo('/battles?scope=mine'), '/battles?scope=mine');
});
