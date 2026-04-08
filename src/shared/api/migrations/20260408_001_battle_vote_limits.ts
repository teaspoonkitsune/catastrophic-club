import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('battle_vote_limits')
    .ifNotExists()
    .addColumn('userId', 'varchar(255)', (column) =>
      column.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('voteDate', 'date', (column) => column.notNull())
    .addColumn('voteCount', 'integer', (column) => column.notNull().defaultTo(0))
    .addColumn('updatedAt', 'timestamptz', (column) => column.notNull())
    .addPrimaryKeyConstraint('battle_vote_limits_pkey', ['userId', 'voteDate'])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('battle_vote_limits').ifExists().execute();
}
