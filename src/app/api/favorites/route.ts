import { NextResponse } from 'next/server';
import {
  deleteFavoriteCat,
  getFavoriteCats,
  saveFavoriteCat,
} from '@/entities/favorite-cat/api/repository';
import { createHttpCatErrorPayload } from '@/shared/lib/http-cat';
import { getAuthSession } from '@/shared/auth';

async function requireSession() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json(
      createHttpCatErrorPayload(401, 'Authentication required'),
      { status: 401 },
    );
  }

  return session;
}

export async function GET(request: Request) {
  try {
    const session = await requireSession();

    if (session instanceof NextResponse) {
      return session;
    }

    const id = new URL(request.url).searchParams.get('id');
    const favorites = await getFavoriteCats(session.user.subject);

    if (id) {
      return NextResponse.json({
        isFavorite: favorites.some((favorite) => favorite.id === id),
      });
    }

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Failed to load favorites', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to load favorites'),
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();

    if (session instanceof NextResponse) {
      return session;
    }

    const body = (await request.json()) as Partial<{
      id: string;
      imageUrl: string;
    }>;

    if (!body.id || !body.imageUrl) {
      return NextResponse.json(createHttpCatErrorPayload(400, 'Invalid data'), { status: 400 });
    }

    const favorite = await saveFavoriteCat(session.user.subject, {
      id: body.id,
      imageUrl: body.imageUrl,
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Failed to save favorite', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to save favorite'),
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await requireSession();

  if (session instanceof NextResponse) {
    return session;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(createHttpCatErrorPayload(400, 'Missing id'), { status: 400 });
  }

  try {
    await deleteFavoriteCat(session.user.subject, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete favorite', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to delete favorite'),
      { status: 500 },
    );
  }
}
