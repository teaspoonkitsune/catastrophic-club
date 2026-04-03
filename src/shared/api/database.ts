import 'dotenv/config';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import type { Database } from './types';

function parseConnectionString(url: string) {
  const parsed = new URL(url);

  return {
    host: parsed.hostname,
    port: parsed.port ? Number.parseInt(parsed.port, 10) : 5432,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
  };
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const connectionParams = parseConnectionString(databaseUrl);

const dialect = new PostgresDialect({
  pool: new Pool({
    ...connectionParams,
    ssl: true,
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
