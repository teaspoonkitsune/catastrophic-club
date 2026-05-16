import { sql } from 'kysely';
import { db, ensureDatabaseMigrated } from '@/shared/api';
import type { CatImage } from '../model/types';
import { getRandomCatImage } from './random-cat';

const CAT_OF_THE_DAY_ATTEMPTS = 8;

type CatOfTheDay = CatImage & {
  dateKey: string;
};

function getUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function ensureKnownCat(cat: CatImage): Promise<void> {
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

async function readCatOfTheDay(dateKey: string): Promise<CatOfTheDay | null> {
  const row = await db
    .selectFrom('cat_of_the_day')
    .selectAll()
    .where('dateKey', '=', dateKey)
    .executeTakeFirst();

  if (!row) {
    return null;
  }

  return {
    dateKey: row.dateKey,
    id: row.catId,
    imageUrl: row.imageUrl,
  };
}

async function tryCreateCatOfTheDay(
  dateKey: string,
  cat: CatImage,
): Promise<CatOfTheDay | null> {
  await ensureKnownCat(cat);

  const inserted = await db
    .insertInto('cat_of_the_day')
    .values({
      dateKey,
      catId: cat.id,
      imageUrl: cat.imageUrl,
      createdAt: new Date(),
    })
    .onConflict((conflict) => conflict.doNothing())
    .returningAll()
    .executeTakeFirst();

  if (!inserted) {
    return readCatOfTheDay(dateKey);
  }

  return {
    dateKey: inserted.dateKey,
    id: inserted.catId,
    imageUrl: inserted.imageUrl,
  };
}

async function getRandomKnownCat(): Promise<CatImage | null> {
  const unusedRow = await db
    .selectFrom('battle_cats')
    .select(['id', 'imageUrl'])
    .where('id', 'not in', (query) => query.selectFrom('cat_of_the_day').select('catId'))
    .orderBy(sql`random()`)
    .executeTakeFirst();

  const row = unusedRow ?? await db
    .selectFrom('battle_cats')
    .select(['id', 'imageUrl'])
    .orderBy(sql`random()`)
    .executeTakeFirst();

  return row
    ? {
      id: row.id,
      imageUrl: row.imageUrl,
    }
    : null;
}

export async function getCatOfTheDay(date = new Date()): Promise<CatOfTheDay> {
  await ensureDatabaseMigrated();

  const dateKey = getUtcDateKey(date);
  const existing = await readCatOfTheDay(dateKey);

  if (existing) {
    return existing;
  }

  for (let attempt = 0; attempt < CAT_OF_THE_DAY_ATTEMPTS; attempt += 1) {
    const cat = await getRandomCatImage();
    const alreadyUsed = await db
      .selectFrom('cat_of_the_day')
      .select('catId')
      .where('catId', '=', cat.id)
      .executeTakeFirst();

    if (alreadyUsed) {
      continue;
    }

    const created = await tryCreateCatOfTheDay(dateKey, cat);

    if (created) {
      return created;
    }
  }

  const fallbackCat = await getRandomKnownCat();

  if (fallbackCat) {
    const created = await tryCreateCatOfTheDay(dateKey, fallbackCat);

    if (created) {
      return created;
    }
  }

  const lastChanceCat = await getRandomCatImage();
  const created = await tryCreateCatOfTheDay(dateKey, lastChanceCat);

  if (created) {
    return created;
  }

  throw new Error('Failed to create cat of the day');
}
