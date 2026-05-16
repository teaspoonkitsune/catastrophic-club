import { buildCatImageUrl } from '../lib/image-url';
import type { CatFact, CatImage } from '../model/types';

export async function getRandomCatImage(): Promise<CatImage> {
  const url = new URL('https://cataas.com/cat');
  url.searchParams.set('json', 'true');
  url.searchParams.set('requestId', crypto.randomUUID());

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cat image');
  }

  const data = (await response.json()) as { id?: string; _id?: string; url?: string };
  const id = data.id ?? data._id;

  if (!id) {
    throw new Error('Cat image response does not include an id');
  }

  return {
    id,
    imageUrl: buildCatImageUrl(id),
  };
}

export async function getRandomCatFact(): Promise<CatFact> {
  const response = await fetch('https://catfact.ninja/fact', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cat fact');
  }

  return (await response.json()) as CatFact;
}
