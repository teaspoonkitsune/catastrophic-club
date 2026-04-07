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

const favoriteStateCache = new Map<string, boolean>();
const favoriteStateRequests = new Map<string, Promise<boolean>>();

export function getCachedFavoriteCatState(id: string): boolean | undefined {
  return favoriteStateCache.get(id);
}

export async function fetchFavoriteCatsFromApi(): Promise<FavoriteCatRecord[]> {
  const response = await fetch('/api/favorites');
  const data = await parseJson<FavoriteCatResponse[]>(response);

  const favoriteCats = data.map(mapFavoriteCat);

  favoriteCats.forEach((cat) => favoriteStateCache.set(cat.id, true));

  return favoriteCats;
}

export async function isFavoriteCatInApi(id: string): Promise<boolean> {
  const cachedState = favoriteStateCache.get(id);

  if (cachedState !== undefined) {
    return cachedState;
  }

  const pendingRequest = favoriteStateRequests.get(id);

  if (pendingRequest) {
    return pendingRequest;
  }

  const url = new URL('/api/favorites', window.location.origin);
  url.searchParams.set('id', id);

  const request = fetch(url)
    .then((response) => parseJson<{ isFavorite: boolean }>(response))
    .then((data) => {
      favoriteStateCache.set(id, data.isFavorite);
      return data.isFavorite;
    })
    .finally(() => {
      favoriteStateRequests.delete(id);
    });

  favoriteStateRequests.set(id, request);
  return request;
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
  const favoriteCat = mapFavoriteCat(data);
  favoriteStateCache.set(input.id, true);

  return favoriteCat;
}

export async function removeFavoriteCatFromApi(id: string): Promise<void> {
  const url = new URL('/api/favorites', window.location.origin);
  url.searchParams.set('id', id);

  const response = await fetch(url, {
    method: 'DELETE',
  });

  await parseJson<{ ok: true }>(response);
  favoriteStateCache.set(id, false);
}
