import { promises as fs } from 'node:fs';
import path from 'node:path';
import { FileMigrationProvider, Migrator } from 'kysely';
import { db } from './database';

let migrationPromise: Promise<void> | null = null;

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
  if (!migrationPromise) {
    migrationPromise = migrateToLatest().catch((error) => {
      migrationPromise = null;
      throw error;
    });
  }

  await migrationPromise;
}
