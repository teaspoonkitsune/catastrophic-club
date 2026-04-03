const CATAAS_IMAGE_BASE_URL = 'https://cataas.com/cat';

export function buildCatImageUrl(id: string): string {
  return `${CATAAS_IMAGE_BASE_URL}/${id}`;
}
