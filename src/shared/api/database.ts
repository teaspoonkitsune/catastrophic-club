import 'dotenv/config';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import type { Database } from './types';

export function getDatabaseSslConfig(databaseUrl: string) {
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

export function getDatabaseConnectionString(databaseUrl: string) {
  const parsed = new URL(databaseUrl);

  parsed.searchParams.delete('sslmode');

  return parsed.toString();
}

let dbInstance: Kysely<Database> | null = null;

function createDatabase() {
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

  return new Kysely<Database>({
    dialect,
  });
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = createDatabase();
  }

  return dbInstance;
}

export const db = new Proxy({} as Kysely<Database>, {
  get(_target, property) {
    const value = Reflect.get(getDb(), property);

    if (typeof value === 'function') {
      return value.bind(getDb());
    }

    return value;
  },
});
