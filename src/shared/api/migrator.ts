import { promises as fs } from 'node:fs';
import path from 'node:path';
import { FileMigrationProvider, Migrator } from 'kysely';
import { db } from './database';

// Reuse the in-flight migration inside one Node process so parallel requests do not race.
let migrationPromise: Promise<void> | null = null;

function shouldAutoRunMigrations() {
  const value = process.env.AUTO_RUN_MIGRATIONS?.trim().toLowerCase();

  if (value === 'true' || value === '1' || value === 'on') {
    return true;
  }

  if (value === 'false' || value === '0' || value === 'off') {
    return false;
  }

  // Default to explicit migrations only. Next.js request runtimes do not reliably
  // support loading raw TypeScript migration files during normal app requests.
  return false;
}

function createMigrator() {
  return new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(process.cwd(), 'src', 'shared', 'api', 'migrations'),
    }),
  });
}

export async function migrateToLatest(): Promise<void> {
  const migrator = createMigrator();
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((result) => {
    console.log(`[db:migrate] ${result.status}: ${result.migrationName}`);
  });

  if (error) {
    throw error;
  }
}

export async function ensureDatabaseMigrated(): Promise<void> {
  if (!shouldAutoRunMigrations()) {
    return;
  }

  if (!migrationPromise) {
    migrationPromise = migrateToLatest().catch((error) => {
      migrationPromise = null;
      throw error;
    });
  }

  await migrationPromise;
}
