import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('cat_of_the_day')
    .ifNotExists()
    .addColumn('dateKey', 'varchar(10)', (column) => column.primaryKey())
    .addColumn('catId', 'varchar(255)', (column) => column.notNull().unique())
    .addColumn('imageUrl', 'varchar(2048)', (column) => column.notNull())
    .addColumn('createdAt', 'timestamptz', (column) => column.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('cat_of_the_day').ifExists().execute();
}
