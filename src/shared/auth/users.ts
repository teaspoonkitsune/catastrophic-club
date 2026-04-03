import 'server-only';

import { db, ensureDatabaseMigrated } from '@/shared/api';

type SyncUserInput = {
  id: string;
  email: string;
  name: string | null;
};

export async function syncAuthenticatedUser(input: SyncUserInput): Promise<void> {
  await ensureDatabaseMigrated();

  await db
    .insertInto('users')
    .values(input)
    .onConflict((conflict) =>
      conflict.column('id').doUpdateSet({
        email: input.email,
        name: input.name,
      }),
    )
    .execute();
}
