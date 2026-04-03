import type { Kysely } from 'kysely';
import { db } from './shared/api/database';
import { ensureDatabaseMigrated } from './shared/api/migrator';
import type { Database } from './shared/api/types';

type CataasCat = {
  _id?: string;
  id?: string;
};

const BATCH_SIZE = 40;
const TARGET_NEW_CATS = 400;
const MAX_BATCHES = 10;
const CATAAS_LIST_URL = 'https://cataas.com/api/cats';
const CATAAS_IMAGE_URL = 'https://cataas.com/cat';
const typedDb: Kysely<Database> = db;

async function fetchCataasCats(skip: number): Promise<CataasCat[]> {
  const url = new URL(CATAAS_LIST_URL);
  url.searchParams.set('limit', String(BATCH_SIZE));
  url.searchParams.set('skip', String(skip));

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cats: ${response.status}`);
  }

  return (await response.json()) as CataasCat[];
}

async function main() {
  await ensureDatabaseMigrated();

  const existingCats = await typedDb.selectFrom('battle_cats').select('id').execute();

  const existingIds = new Set(existingCats.map((cat) => cat.id));

  const newCats: Array<{
    id: string;
    imageUrl: string;
    score: number;
    createdAt: Date;
  }> = [];

  let fetchedCount = 0;

  for (let batchIndex = 0; batchIndex < MAX_BATCHES; batchIndex += 1) {
    const cats = await fetchCataasCats(batchIndex * BATCH_SIZE);
    fetchedCount += cats.length;

    if (cats.length === 0) {
      break;
    }

    for (const cat of cats) {
      const id = cat._id ?? cat.id;

      if (!id || existingIds.has(id)) {
        continue;
      }

      existingIds.add(id);
      newCats.push({
        id,
        imageUrl: `${CATAAS_IMAGE_URL}/${id}`,
        score: 0,
        createdAt: new Date(),
      });

      if (newCats.length >= TARGET_NEW_CATS) {
        break;
      }
    }

    if (newCats.length >= TARGET_NEW_CATS) {
      break;
    }
  }

  if (fetchedCount === 0) {
    throw new Error('No cats returned from Cataas');
  }

  if (newCats.length > 0) {
    await typedDb.insertInto('battle_cats').values(newCats).execute();
  }

  const total = await typedDb
    .selectFrom('battle_cats')
    .select((builder) => builder.fn.count<string>('id').as('count'))
    .executeTakeFirstOrThrow();

  console.log(
    `Fetched ${fetchedCount} cats across ${MAX_BATCHES} batches max, added ${newCats.length} new cats. Total in battle_cats: ${total.count}`,
  );
}

main()
  .then(async () => {
    await typedDb.destroy();
  })
  .catch(async (error) => {
    console.error('Error:', error);
    await typedDb.destroy();
    process.exit(1);
  });
