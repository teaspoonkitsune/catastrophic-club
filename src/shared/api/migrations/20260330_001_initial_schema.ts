import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('favorite_cats')
    .ifNotExists()
    .addColumn('id', 'varchar(255)', (column) => column.primaryKey())
    .addColumn('imageUrl', 'varchar(2048)', (column) => column.notNull())
    .addColumn('addedAt', 'timestamptz', (column) => column.notNull())
    .execute();

  await db.schema
    .createTable('battle_cats')
    .ifNotExists()
    .addColumn('id', 'varchar(255)', (column) => column.primaryKey())
    .addColumn('imageUrl', 'varchar(2048)', (column) => column.notNull())
    .addColumn('score', 'integer', (column) => column.notNull().defaultTo(0))
    .addColumn('createdAt', 'timestamptz', (column) => column.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('battle_cats').ifExists().execute();
  await db.schema.dropTable('favorite_cats').ifExists().execute();
}
