import { buildCatImageUrl } from '@/entities/cat';
import { db, ensureDatabaseMigrated } from '@/shared/api';
import type { FavoriteCat, FavoriteCatInput } from '../model/types';

export async function getFavoriteCats(userId: string): Promise<FavoriteCat[]> {
  await ensureDatabaseMigrated();

  return db
    .selectFrom('favorite_cats')
    .selectAll()
    .where('userId', '=', userId)
    .orderBy('addedAt', 'desc')
    .execute();
}

export async function saveFavoriteCat(
  userId: string,
  input: FavoriteCatInput,
): Promise<FavoriteCat> {
  await ensureDatabaseMigrated();

  const existing = await db
    .selectFrom('favorite_cats')
    .selectAll()
    .where('userId', '=', userId)
    .where('id', '=', input.id)
    .executeTakeFirst();

  if (existing) {
    return existing;
  }

  return db
    .insertInto('favorite_cats')
    .values({
      userId,
      ...input,
      imageUrl: buildCatImageUrl(input.id),
      addedAt: new Date(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function deleteFavoriteCat(userId: string, id: string): Promise<void> {
  await ensureDatabaseMigrated();
  await db
    .deleteFrom('favorite_cats')
    .where('userId', '=', userId)
    .where('id', '=', id)
    .execute();
}
