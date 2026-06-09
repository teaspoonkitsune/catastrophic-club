import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatImageUrl } from './image-url';

test('buildCatImageUrl points to the cataas cat endpoint', () => {
  assert.equal(buildCatImageUrl('abc123'), 'https://cataas.com/cat/abc123');
});
