import { buildCatImageUrl } from '../lib/image-url';
import type { CatFact, CatImage } from '../model/types';

export async function getRandomCatImage(): Promise<CatImage> {
  const response = await fetch('https://cataas.com/cat?json=true', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cat image');
  }

  const data = (await response.json()) as { id: string; url: string };

  return {
    id: data.id,
    imageUrl: buildCatImageUrl(data.id),
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
