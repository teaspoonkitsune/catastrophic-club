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

  return process.env.NODE_ENV !== 'production';
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
