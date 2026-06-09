import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateTime, getIntlLocale } from './format';

test('getIntlLocale maps supported locales and falls back to default', () => {
  assert.equal(getIntlLocale('ru'), 'ru-RU');
  assert.equal(getIntlLocale('en'), 'en-US');
  assert.equal(getIntlLocale('uk'), 'uk-UA');
  assert.equal(getIntlLocale('de'), 'en-US');
  assert.equal(getIntlLocale(undefined), 'en-US');
});

test('formatDateTime uses locale-aware formatting', () => {
  const value = '2026-06-13T14:05:00.000Z';

  const en = formatDateTime(value, 'en', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const uk = formatDateTime(value, 'uk', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  assert.match(en, /June|13|2026/);
  assert.notEqual(en, uk);
});
