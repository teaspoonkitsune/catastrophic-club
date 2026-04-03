import { sql } from 'kysely';
import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'varchar(255)', (column) => column.primaryKey())
    .addColumn('email', 'varchar(320)', (column) => column.notNull())
    .addColumn('name', 'varchar(255)')
    .execute();

  await sql`
    INSERT INTO users ("id", "email", "name")
    SELECT DISTINCT
      "userId",
      CASE
        WHEN "userId" IN ('legacy-global', '__legacy__') THEN 'legacy@catastrophic.club'
        ELSE "userId" || '@keycloak.local'
      END,
      CASE
        WHEN "userId" IN ('legacy-global', '__legacy__') THEN 'Legacy favorites'
        ELSE NULL
      END
    FROM favorite_cats
    WHERE NOT EXISTS (
      SELECT 1
      FROM users
      WHERE users."id" = favorite_cats."userId"
    )
    ON CONFLICT ("id") DO NOTHING
  `.execute(db);

  await sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'favorite_cats'
          AND column_name = 'userId'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'favorite_cats'
          AND constraint_name = 'favorite_cats_user_fk'
      ) THEN
        ALTER TABLE favorite_cats
          ADD CONSTRAINT favorite_cats_user_fk
          FOREIGN KEY ("userId")
          REFERENCES users("id")
          ON DELETE CASCADE;
      END IF;
    END $$;
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'favorite_cats'
          AND constraint_name = 'favorite_cats_user_fk'
      ) THEN
        ALTER TABLE favorite_cats DROP CONSTRAINT favorite_cats_user_fk;
      END IF;
    END $$;
  `.execute(db);
}
