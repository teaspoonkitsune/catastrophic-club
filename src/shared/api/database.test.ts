import test from 'node:test';
import assert from 'node:assert/strict';
import { getDatabaseConnectionString, getDatabaseSslConfig } from './database';

const originalDatabaseSsl = process.env.DATABASE_SSL;

test.afterEach(() => {
  if (originalDatabaseSsl === undefined) {
    delete process.env.DATABASE_SSL;
    return;
  }

  process.env.DATABASE_SSL = originalDatabaseSsl;
});

test('getDatabaseSslConfig respects explicit env overrides', () => {
  process.env.DATABASE_SSL = 'false';
  assert.equal(getDatabaseSslConfig('postgres://user:pass@localhost:5432/db'), false);

  process.env.DATABASE_SSL = 'true';
  assert.equal(getDatabaseSslConfig('postgres://user:pass@localhost:5432/db'), true);

  process.env.DATABASE_SSL = 'no-verify';
  assert.deepEqual(getDatabaseSslConfig('postgres://user:pass@localhost:5432/db'), {
    rejectUnauthorized: false,
  });
});

test('getDatabaseSslConfig falls back to sslmode parsing from the connection string', () => {
  delete process.env.DATABASE_SSL;

  assert.equal(
    getDatabaseSslConfig('postgres://user:pass@localhost:5432/db?sslmode=disable'),
    false,
  );
  assert.deepEqual(
    getDatabaseSslConfig('postgres://user:pass@localhost:5432/db?sslmode=prefer'),
    { rejectUnauthorized: false },
  );
  assert.equal(
    getDatabaseSslConfig('postgres://user:pass@localhost:5432/db?sslmode=require'),
    true,
  );
});

test('getDatabaseConnectionString strips sslmode while preserving the rest', () => {
  assert.equal(
    getDatabaseConnectionString('postgres://user:pass@localhost:5432/db?sslmode=require&application_name=cat-app'),
    'postgres://user:pass@localhost:5432/db?application_name=cat-app',
  );
});
