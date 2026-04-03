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
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'id'
          AND data_type IN ('smallint', 'integer', 'bigint')
      ) THEN
        DROP TABLE IF EXISTS users_legacy;
        ALTER TABLE users RENAME TO users_legacy;

        CREATE TABLE users (
          "id" varchar(255) PRIMARY KEY,
          "email" varchar(320) NOT NULL,
          "name" varchar(255)
        );

        INSERT INTO users ("id", "email", "name")
        SELECT CAST("id" AS varchar(255)), "email", "name"
        FROM users_legacy
        ON CONFLICT ("id") DO NOTHING;

        DROP TABLE users_legacy;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'favorite_cats'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'favorite_cats'
          AND column_name = 'userId'
      ) THEN
        INSERT INTO users ("id", "email", "name")
        VALUES ('legacy-global', 'legacy-global@catastrophic.club', 'Legacy favorites')
        ON CONFLICT ("id") DO NOTHING;

        ALTER TABLE favorite_cats RENAME TO favorite_cats_legacy;

        CREATE TABLE favorite_cats (
          "userId" varchar(255) NOT NULL REFERENCES users("id") ON DELETE CASCADE,
          "id" varchar(255) NOT NULL,
          "imageUrl" varchar(2048) NOT NULL,
          "addedAt" timestamptz NOT NULL,
          PRIMARY KEY ("userId", "id")
        );

        INSERT INTO favorite_cats ("userId", "id", "imageUrl", "addedAt")
        SELECT 'legacy-global', "id", "imageUrl", "addedAt"
        FROM favorite_cats_legacy
        ON CONFLICT ("userId", "id") DO NOTHING;

        DROP TABLE favorite_cats_legacy;
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
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'favorite_cats'
          AND column_name = 'userId'
      ) THEN
        ALTER TABLE favorite_cats RENAME TO favorite_cats_scoped;

        CREATE TABLE favorite_cats (
          "id" varchar(255) PRIMARY KEY,
          "imageUrl" varchar(2048) NOT NULL,
          "addedAt" timestamptz NOT NULL
        );

        INSERT INTO favorite_cats ("id", "imageUrl", "addedAt")
        SELECT DISTINCT ON ("id") "id", "imageUrl", "addedAt"
        FROM favorite_cats_scoped
        ORDER BY "id", "addedAt" DESC;

        DROP TABLE favorite_cats_scoped;
      END IF;
    END $$;
  `.execute(db);

  await db.schema.dropTable('users').ifExists().execute();
}
