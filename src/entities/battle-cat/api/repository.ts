import { sql } from 'kysely';
import { getRandomCatImage } from '@/entities/cat';
import { db, ensureDatabaseMigrated } from '@/shared/api';
import type { BattleCat, BattleResultInput } from '../model/types';

async function createBattleCat(): Promise<void> {
  const cat = await getRandomCatImage();

  await db
    .insertInto('battle_cats')
    .values({
      id: cat.id,
      imageUrl: cat.imageUrl,
      score: 0,
      createdAt: new Date(),
    })
    .onConflict((conflict) => conflict.column('id').doNothing())
    .execute();
}

export async function ensureBattleCatPool(minCount = 6): Promise<void> {
  await ensureDatabaseMigrated();

  let currentCount = Number(
    (await db
      .selectFrom('battle_cats')
      .select((builder) => builder.fn.count<string>('id').as('count'))
      .executeTakeFirstOrThrow()).count,
  );

  let attempts = 0;

  while (currentCount < minCount && attempts < minCount * 3) {
    await createBattleCat();
    currentCount = Number(
      (await db
        .selectFrom('battle_cats')
        .select((builder) => builder.fn.count<string>('id').as('count'))
        .executeTakeFirstOrThrow()).count,
    );
    attempts += 1;
  }
}

export async function getBattlePair(): Promise<BattleCat[]> {
  await ensureBattleCatPool(6);

  const pair = await db
    .selectFrom('battle_cats')
    .selectAll()
    .orderBy(sql`random()`)
    .limit(2)
    .execute();

  if (pair.length < 2) {
    throw new Error('Not enough cats for battle');
  }

  return pair;
}

export async function getBattleLeaderboard(): Promise<BattleCat[]> {
  await ensureDatabaseMigrated();

  return db
    .selectFrom('battle_cats')
    .selectAll()
    .where('score', '!=', 0)
    .orderBy('score', 'desc')
    .orderBy('createdAt', 'asc')
    .execute();
}

export async function recordBattleResult(
  input: BattleResultInput,
): Promise<void> {
  await ensureDatabaseMigrated();

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('battle_cats')
      .set({
        score: sql<number>`score + 1`,
      })
      .where('id', '=', input.winnerId)
      .execute();

    await trx
      .updateTable('battle_cats')
      .set({
        score: sql<number>`score - 1`,
      })
      .where('id', '=', input.loserId)
      .execute();
  });
}
