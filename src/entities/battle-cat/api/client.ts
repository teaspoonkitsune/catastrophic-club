'use client';

import { HttpCatError, type HttpCatErrorPayload } from '@/shared/lib/http-cat';
import type {
  BattleCatRecord,
  BattleHistoryPage,
  BattleHistoryRecord,
  BattleResultInput,
} from '../model/types';

type BattlePairResponse = {
  pair: BattleCatRecord[];
  historyEntry?: BattleHistoryRecord;
};

type BattleVoteLimitResponse = {
  dailyLimitReached: true;
};

type BattleSubmitResponse = BattlePairResponse | BattleVoteLimitResponse;

type BattleHistoryScope = 'global' | 'mine';

type BattleHistoryRefreshResponse =
  | {
      changed: false;
      latestId: string | null;
    }
  | {
      changed: true;
      latestId: string | null;
      page: BattleHistoryPage;
    };

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json()) as Partial<HttpCatErrorPayload>;

    throw new HttpCatError({
      error: payload.error,
      status: payload.status ?? response.status,
      catImageUrl: payload.catImageUrl,
    });
  }

  return (await response.json()) as T;
}

export async function fetchBattlePair(): Promise<BattleCatRecord[]> {
  const response = await fetch('/api/battles', { cache: 'no-store' });
  const data = await parseJson<BattlePairResponse>(response);
  return data.pair;
}

export async function submitBattleResult(
  input: Omit<BattleResultInput, 'userId'>,
): Promise<BattleSubmitResponse> {
  const response = await fetch('/api/battles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (response.status === 429) {
    return { dailyLimitReached: true };
  }

  const data = await parseJson<BattlePairResponse>(response);
  return data;
}

export async function fetchBattleHistoryPage({
  scope,
  cursor,
  limit = 10,
}: {
  scope: BattleHistoryScope;
  cursor?: string | null;
  limit?: number;
}): Promise<BattleHistoryPage> {
  const params = new URLSearchParams({
    scope,
    limit: String(limit),
  });

  if (cursor) {
    params.set('cursor', cursor);
  }

  const response = await fetch(`/api/battles/history?${params.toString()}`, {
    cache: 'no-store',
  });

  const data = await parseJson<BattleHistoryRefreshResponse | BattleHistoryPage>(response);

  if ('items' in data) {
    return data;
  }

  if (!data.changed) {
    throw new Error('Expected battle history page but received unchanged refresh payload');
  }

  return data.page;
}

export async function refreshBattleHistoryPage({
  scope,
  headId,
  limit = 10,
}: {
  scope: BattleHistoryScope;
  headId: string | null;
  limit?: number;
}): Promise<BattleHistoryRefreshResponse> {
  const params = new URLSearchParams({
    scope,
    offset: '0',
    limit: String(limit),
  });

  if (headId) {
    params.set('headId', headId);
  }

  const response = await fetch(`/api/battles/history?${params.toString()}`, {
    cache: 'no-store',
  });

  const data = await parseJson<BattleHistoryRefreshResponse | BattleHistoryPage>(response);

  if ('items' in data) {
    return {
      changed: true,
      latestId: data.items[0]?.id ?? null,
      page: data,
    };
  }

  return data;
}
