import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Kept as a no-op migration to preserve the historical migration order.
  void db;
}

export async function down(db: Kysely<unknown>): Promise<void> {
  void db;
}
