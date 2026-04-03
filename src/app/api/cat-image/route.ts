import { NextResponse } from 'next/server';
import { getRandomCatImage } from '@/entities/cat';
import { createHttpCatErrorPayload } from '@/shared/lib/http-cat';

export async function GET() {
  try {
    const cat = await getRandomCatImage();
    return NextResponse.json(cat);
  } catch (error) {
    console.error('Failed to load cat image', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to load cat image'),
      { status: 500 },
    );
  }
}
