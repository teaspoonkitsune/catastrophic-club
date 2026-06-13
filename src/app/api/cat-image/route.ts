import { NextResponse } from 'next/server';
import { getRandomCatImage } from '@/entities/cat';
import { createHttpCatErrorPayload } from '@/shared/lib/http-cat';
import { createLogger } from '@/shared/lib/logger';

const logger = createLogger('api.cat-image');

export async function GET() {
  try {
    const cat = await getRandomCatImage();
    return NextResponse.json(cat);
  } catch (error) {
    logger.error('cat_image.load_failed', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to load cat image'),
      { status: 500 },
    );
  }
}
