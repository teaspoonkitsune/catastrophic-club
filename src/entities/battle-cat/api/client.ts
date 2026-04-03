'use client';

import { HttpCatError, type HttpCatErrorPayload } from '@/shared/lib/http-cat';
import type { BattleCatRecord, BattleResultInput } from '../model/types';

type BattlePairResponse = {
  pair: BattleCatRecord[];
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
  input: BattleResultInput,
): Promise<BattleCatRecord[]> {
  const response = await fetch('/api/battles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await parseJson<BattlePairResponse>(response);
  return data.pair;
}
