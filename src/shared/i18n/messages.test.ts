import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultLocale,
  getMessages,
  isLocale,
  normalizeLocale,
  supportedLocales,
} from './messages';

test('supported locales include Russian, English, and Ukrainian', () => {
  assert.deepEqual(supportedLocales, ['ru', 'en', 'uk']);
  assert.equal(defaultLocale, 'en');
});

test('isLocale and normalizeLocale accept only supported locales', () => {
  assert.equal(isLocale('ru'), true);
  assert.equal(isLocale('uk'), true);
  assert.equal(isLocale('de'), false);

  assert.equal(normalizeLocale(' EN '), 'en');
  assert.equal(normalizeLocale('uk'), 'uk');
  assert.equal(normalizeLocale('pl'), null);
  assert.equal(normalizeLocale(null), null);
});

test('getMessages returns localized labels for each locale', () => {
  assert.equal(getMessages('ru').header.locale.uk, 'Українська');
  assert.equal(getMessages('en').header.locale.uk, 'Ukrainian');
  assert.equal(getMessages('uk').header.locale.label, 'Мова');
});
