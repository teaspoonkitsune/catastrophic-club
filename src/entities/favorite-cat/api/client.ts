'use client';

import { HttpCatError, type HttpCatErrorPayload } from '@/shared/lib/http-cat';
import type { FavoriteCatInput, FavoriteCatRecord } from '../model/types';

type FavoriteCatResponse = {
  id: string;
  imageUrl: string;
  addedAt: string;
};

function mapFavoriteCat(response: FavoriteCatResponse): FavoriteCatRecord {
  return {
    id: response.id,
    imageUrl: response.imageUrl,
    addedAt: response.addedAt,
  };
}

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

export async function fetchFavoriteCatsFromApi(): Promise<FavoriteCatRecord[]> {
  const response = await fetch('/api/favorites');
  const data = await parseJson<FavoriteCatResponse[]>(response);

  return data.map(mapFavoriteCat);
}

export async function isFavoriteCatInApi(id: string): Promise<boolean> {
  const url = new URL('/api/favorites', window.location.origin);
  url.searchParams.set('id', id);

  const response = await fetch(url);
  const data = await parseJson<{ isFavorite: boolean }>(response);

  return data.isFavorite;
}

export async function addFavoriteCatToApi(
  input: FavoriteCatInput,
): Promise<FavoriteCatRecord> {
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await parseJson<FavoriteCatResponse>(response);
  return mapFavoriteCat(data);
}

export async function removeFavoriteCatFromApi(id: string): Promise<void> {
  const url = new URL('/api/favorites', window.location.origin);
  url.searchParams.set('id', id);

  const response = await fetch(url, {
    method: 'DELETE',
  });

  await parseJson<{ ok: true }>(response);
}
