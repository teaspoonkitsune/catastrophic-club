import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('battle_history')
    .ifNotExists()
    .addColumn('id', 'varchar(255)', (column) => column.primaryKey())
    .addColumn('userId', 'varchar(255)', (column) =>
      column.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('winnerId', 'varchar(255)', (column) => column.notNull())
    .addColumn('winnerImageUrl', 'varchar(2048)', (column) => column.notNull())
    .addColumn('loserId', 'varchar(255)', (column) => column.notNull())
    .addColumn('loserImageUrl', 'varchar(2048)', (column) => column.notNull())
    .addColumn('createdAt', 'timestamptz', (column) => column.notNull())
    .execute();

  await db.schema
    .createIndex('battle_history_created_at_idx')
    .ifNotExists()
    .on('battle_history')
    .column('createdAt')
    .execute();

  await db.schema
    .createIndex('battle_history_user_created_at_idx')
    .ifNotExists()
    .on('battle_history')
    .columns(['userId', 'createdAt'])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex('battle_history_user_created_at_idx').ifExists().execute();
  await db.schema.dropIndex('battle_history_created_at_idx').ifExists().execute();
  await db.schema.dropTable('battle_history').ifExists().execute();
}
