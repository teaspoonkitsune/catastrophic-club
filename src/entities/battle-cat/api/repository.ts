import { randomUUID } from 'node:crypto';
import { sql, type Transaction } from 'kysely';
import { getRandomCatImage, type CatImage } from '@/entities/cat';
import { db, ensureDatabaseMigrated } from '@/shared/api';
import type { Database } from '@/shared/api';
import type {
  BattleCat,
  BattleLeaderboardPage,
  BattleHistoryPage,
  BattleHistoryRecord,
  BattleResultInput,
} from '../model/types';

const BATTLE_HISTORY_LIMIT = 10;
const BATTLE_LEADERBOARD_LIMIT = 10;
const BATTLE_LEADERBOARD_MAX_OFFSET = 10_000;
const DAILY_BATTLE_VOTE_LIMIT = 5;
const BATTLE_PAIR_RANDOM_ATTEMPTS = 8;

type BattleHistoryCursorData = {
  createdAt: string;
  id: string;
};

function getUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toBattleHistoryRecord(entry: {
  id: string;
  winnerId: string;
  winnerImageUrl: string;
  loserId: string;
  loserImageUrl: string;
  createdAt: Date;
}): BattleHistoryRecord {
  return {
    id: entry.id,
    winnerId: entry.winnerId,
    winnerImageUrl: entry.winnerImageUrl,
    loserId: entry.loserId,
    loserImageUrl: entry.loserImageUrl,
    createdAt: entry.createdAt.toISOString(),
  };
}

function encodeBattleHistoryCursor(entry: {
  createdAt: Date;
  id: string;
}) {
  return Buffer.from(
    JSON.stringify({
      createdAt: entry.createdAt.toISOString(),
      id: entry.id,
    } satisfies BattleHistoryCursorData),
    'utf8',
  ).toString('base64url');
}

function decodeBattleHistoryCursor(value: string): BattleHistoryCursorData {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8'),
    ) as Partial<BattleHistoryCursorData>;

    if (!parsed.createdAt || !parsed.id) {
      throw new Error('Invalid battle history cursor');
    }

    return {
      createdAt: parsed.createdAt,
      id: parsed.id,
    };
  } catch {
    throw new Error('Invalid battle history cursor');
  }
}

async function getRandomBattleCatImages(): Promise<[CatImage, CatImage]> {
  const firstCat = await getRandomCatImage();
  let attempts = 0;

  while (attempts < BATTLE_PAIR_RANDOM_ATTEMPTS) {
    const secondCat = await getRandomCatImage();
    attempts += 1;

    if (secondCat.id !== firstCat.id) {
      return [firstCat, secondCat];
    }
  }

  throw new Error('Failed to load two different cats for battle');
}

async function syncBattleCats(cats: [CatImage, CatImage]): Promise<[BattleCat, BattleCat]> {
  const now = new Date();

  await db
    .insertInto('battle_cats')
    .values(cats.map((cat) => ({
      id: cat.id,
      imageUrl: cat.imageUrl,
      score: 0,
      createdAt: now,
    })))
    .onConflict((conflict) => conflict.column('id').doNothing())
    .execute();

  const rows = await db
    .selectFrom('battle_cats')
    .selectAll()
    .where('id', 'in', cats.map((cat) => cat.id))
    .execute();

  const rowById = new Map(rows.map((row) => [row.id, row]));
  const firstCat = rowById.get(cats[0].id);
  const secondCat = rowById.get(cats[1].id);

  if (!firstCat || !secondCat) {
    throw new Error('Failed to sync battle cats');
  }

  return [firstCat, secondCat];
}

async function claimDailyBattleVote(
  trx: Transaction<Database>,
  userId: string,
  now: Date,
): Promise<boolean> {
  const voteDate = getUtcDateKey(now);
  const result = await sql<{ voteCount: number }>`
    insert into battle_vote_limits ("userId", "voteDate", "voteCount", "updatedAt")
    values (${userId}, ${voteDate}::date, 1, ${now})
    on conflict ("userId", "voteDate")
    do update set
      "voteCount" = battle_vote_limits."voteCount" + 1,
      "updatedAt" = excluded."updatedAt"
    where battle_vote_limits."voteCount" < ${DAILY_BATTLE_VOTE_LIMIT}
    returning "voteCount"
  `.execute(trx);

  return result.rows.length > 0;
}

export async function getBattlePair(): Promise<BattleCat[]> {
  await ensureDatabaseMigrated();

  return syncBattleCats(await getRandomBattleCatImages());
}

export async function getBattleLeaderboard({
  offset = 0,
  limit = BATTLE_LEADERBOARD_LIMIT,
}: {
  offset?: number;
  limit?: number;
} = {}): Promise<BattleLeaderboardPage> {
  await ensureDatabaseMigrated();

  const safeLimit = Math.min(Math.max(1, limit), BATTLE_LEADERBOARD_LIMIT);
  const safeOffset = Math.min(Math.max(0, offset), BATTLE_LEADERBOARD_MAX_OFFSET);
  const rows = await db
    .selectFrom('battle_cats')
    .selectAll()
    .where('score', '!=', 0)
    .orderBy('score', 'desc')
    .orderBy('createdAt', 'asc')
    .orderBy('id', 'asc')
    .offset(safeOffset)
    .limit(safeLimit + 1)
    .execute();

  return {
    items: rows.slice(0, safeLimit),
    hasNext: rows.length > safeLimit,
    offset: safeOffset,
    limit: safeLimit,
  };
}

export async function recordBattleResult(
  input: BattleResultInput,
): Promise<BattleHistoryRecord | null> {
  await ensureDatabaseMigrated();

  // Keep the rate-limit claim, score changes, and history row atomic for a single vote.
  return db.transaction().execute(async (trx) => {
    const cats = await trx
      .selectFrom('battle_cats')
      .select(['id', 'imageUrl'])
      .where('id', 'in', [input.winnerId, input.loserId])
      .execute();
    const winner = cats.find((cat) => cat.id === input.winnerId);
    const loser = cats.find((cat) => cat.id === input.loserId);

    if (!winner || !loser) {
      throw new Error('Battle result references unknown cats');
    }

    const createdAt = new Date();
    const hasVoteLeft = await claimDailyBattleVote(trx, input.userId, createdAt);

    if (!hasVoteLeft) {
      return null;
    }

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

    // Store image URLs as snapshots so old history stays readable if a cat row changes.
    const historyEntry = {
      id: randomUUID(),
      userId: input.userId,
      winnerId: winner.id,
      winnerImageUrl: winner.imageUrl,
      loserId: loser.id,
      loserImageUrl: loser.imageUrl,
      createdAt,
    };

    await trx
      .insertInto('battle_history')
      .values(historyEntry)
      .execute();

    return toBattleHistoryRecord(historyEntry);
  });
}

export async function getBattleHistoryPage({
  userId,
  cursor,
  limit = BATTLE_HISTORY_LIMIT,
}: {
  userId?: string;
  cursor?: string | null;
  limit?: number;
} = {}): Promise<BattleHistoryPage> {
  await ensureDatabaseMigrated();

  const safeLimit = Math.min(Math.max(1, limit), BATTLE_HISTORY_LIMIT);
  const cursorData = cursor ? decodeBattleHistoryCursor(cursor) : null;
  const rows = await db
    .selectFrom('battle_history')
    .select([
      'id',
      'winnerId',
      'winnerImageUrl',
      'loserId',
      'loserImageUrl',
      'createdAt',
    ])
    .$if(Boolean(userId), (query) => query.where('userId', '=', userId ?? ''))
    .$if(Boolean(cursorData), (query) =>
      query.where((expressionBuilder) =>
        expressionBuilder.or([
          expressionBuilder('createdAt', '<', new Date(cursorData?.createdAt ?? '')),
          expressionBuilder.and([
            expressionBuilder('createdAt', '=', new Date(cursorData?.createdAt ?? '')),
            expressionBuilder('id', '<', cursorData?.id ?? ''),
          ]),
        ]),
      ),
    )
    .orderBy('createdAt', 'desc')
    .orderBy('id', 'desc')
    // Fetch one extra row to detect the next page without a separate count query.
    .limit(safeLimit + 1)
    .execute();

  const pageItems = rows.slice(0, safeLimit);
  const lastVisibleRow = pageItems.at(-1);

  return {
    items: pageItems.map(toBattleHistoryRecord),
    hasNext: rows.length > safeLimit,
    nextCursor:
      rows.length > safeLimit && lastVisibleRow
        ? encodeBattleHistoryCursor(lastVisibleRow)
        : null,
    limit: safeLimit,
  };
}

export async function getLatestBattleHistoryEntryId(userId?: string): Promise<string | null> {
  await ensureDatabaseMigrated();

  const row = await db
    .selectFrom('battle_history')
    .select('id')
    .$if(Boolean(userId), (query) => query.where('userId', '=', userId ?? ''))
    .orderBy('createdAt', 'desc')
    .orderBy('id', 'desc')
    .executeTakeFirst();

  return row?.id ?? null;
}
