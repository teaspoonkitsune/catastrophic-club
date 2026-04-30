import 'dotenv/config';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import type { Database } from './types';

function getDatabaseSslConfig(databaseUrl: string) {
  const value = process.env.DATABASE_SSL?.trim().toLowerCase();

  if (value === 'false' || value === '0' || value === 'off') {
    return false;
  }

  if (value === 'no-verify') {
    return {
      rejectUnauthorized: false,
    };
  }

  if (value === 'true' || value === '1' || value === 'on') {
    return true;
  }

  const parsed = new URL(databaseUrl);
  const sslMode = parsed.searchParams.get('sslmode')?.toLowerCase();

  if (!sslMode || sslMode === 'disable') {
    return false;
  }

  if (sslMode === 'no-verify' || sslMode === 'allow' || sslMode === 'prefer') {
    return {
      rejectUnauthorized: false,
    };
  }

  return true;
}

function getDatabaseConnectionString(databaseUrl: string) {
  const parsed = new URL(databaseUrl);

  parsed.searchParams.delete('sslmode');

  return parsed.toString();
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: getDatabaseConnectionString(databaseUrl),
    ssl: getDatabaseSslConfig(databaseUrl),
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
