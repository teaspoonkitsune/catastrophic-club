import { randomUUID } from 'node:crypto';
import { sql, type Transaction } from 'kysely';
import { getRandomCatImage } from '@/entities/cat';
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
const BATTLE_HISTORY_MAX_OFFSET = 10_000;
const BATTLE_LEADERBOARD_LIMIT = 10;
const BATTLE_LEADERBOARD_MAX_OFFSET = 10_000;
const DAILY_BATTLE_VOTE_LIMIT = 5;

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

export async function ensureBattleCatPool(minCount = 6): Promise<void> {
  await ensureDatabaseMigrated();

  let currentCount = Number(
    (await db
      .selectFrom('battle_cats')
      .select((builder) => builder.fn.count<string>('id').as('count'))
      .executeTakeFirstOrThrow()).count,
  );

  let attempts = 0;

  // Cataas can return duplicate ids, so onConflict may make an attempt a no-op.
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
  offset = 0,
  limit = BATTLE_HISTORY_LIMIT,
}: {
  userId?: string;
  offset?: number;
  limit?: number;
} = {}): Promise<BattleHistoryPage> {
  await ensureDatabaseMigrated();

  const safeLimit = Math.min(Math.max(1, limit), BATTLE_HISTORY_LIMIT);
  const safeOffset = Math.min(Math.max(0, offset), BATTLE_HISTORY_MAX_OFFSET);
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
    .orderBy('createdAt', 'desc')
    .orderBy('id', 'desc')
    .offset(safeOffset)
    // Fetch one extra row to detect the next page without a separate count query.
    .limit(safeLimit + 1)
    .execute();

  return {
    items: rows.slice(0, safeLimit).map(toBattleHistoryRecord),
    hasNext: rows.length > safeLimit,
    offset: safeOffset,
    limit: safeLimit,
  };
}
