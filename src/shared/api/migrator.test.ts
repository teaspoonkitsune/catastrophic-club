import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldAutoRunMigrations } from './migrator';

const originalAutoRunMigrations = process.env.AUTO_RUN_MIGRATIONS;

test.afterEach(() => {
  if (originalAutoRunMigrations === undefined) {
    delete process.env.AUTO_RUN_MIGRATIONS;
    return;
  }

  process.env.AUTO_RUN_MIGRATIONS = originalAutoRunMigrations;
});

test('shouldAutoRunMigrations enables known truthy values', () => {
  process.env.AUTO_RUN_MIGRATIONS = 'true';
  assert.equal(shouldAutoRunMigrations(), true);

  process.env.AUTO_RUN_MIGRATIONS = '1';
  assert.equal(shouldAutoRunMigrations(), true);

  process.env.AUTO_RUN_MIGRATIONS = 'on';
  assert.equal(shouldAutoRunMigrations(), true);
});

test('shouldAutoRunMigrations disables known falsy and unknown values', () => {
  process.env.AUTO_RUN_MIGRATIONS = 'false';
  assert.equal(shouldAutoRunMigrations(), false);

  process.env.AUTO_RUN_MIGRATIONS = 'off';
  assert.equal(shouldAutoRunMigrations(), false);

  process.env.AUTO_RUN_MIGRATIONS = 'maybe';
  assert.equal(shouldAutoRunMigrations(), false);

  delete process.env.AUTO_RUN_MIGRATIONS;
  assert.equal(shouldAutoRunMigrations(), false);
});
