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

type BattleHistoryScope = 'global' | 'mine';

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
): Promise<BattlePairResponse> {
  const response = await fetch('/api/battles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await parseJson<BattlePairResponse>(response);
  return data;
}

export async function fetchBattleHistoryPage({
  scope,
  offset,
  limit = 10,
}: {
  scope: BattleHistoryScope;
  offset: number;
  limit?: number;
}): Promise<BattleHistoryPage> {
  const params = new URLSearchParams({
    scope,
    offset: String(Math.max(0, offset)),
    limit: String(limit),
  });
  const response = await fetch(`/api/battles/history?${params.toString()}`, {
    cache: 'no-store',
  });

  return parseJson<BattleHistoryPage>(response);
}
