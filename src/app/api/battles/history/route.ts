import { NextResponse } from 'next/server';
import { getBattleHistoryPage } from '@/entities/battle-cat/api/repository';
import { getAuthSession } from '@/shared/auth';
import { createHttpCatErrorPayload } from '@/shared/lib/http-cat';

const MAX_HISTORY_OFFSET = 10_000;

function parsePositiveInteger(
  value: string | null,
  fallback: number,
  maxValue: number,
) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.min(parsed, maxValue);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const scope = url.searchParams.get('scope') === 'mine' ? 'mine' : 'global';
    const offset = parsePositiveInteger(
      url.searchParams.get('offset'),
      0,
      MAX_HISTORY_OFFSET,
    );
    const limit = parsePositiveInteger(url.searchParams.get('limit'), 10, 10);

    if (scope === 'mine') {
      const session = await getAuthSession();

      if (!session) {
        return NextResponse.json(
          createHttpCatErrorPayload(401, 'Authentication required'),
          { status: 401 },
        );
      }

      const page = await getBattleHistoryPage({
        userId: session.user.subject,
        offset,
        limit,
      });

      return NextResponse.json(page);
    }

    const page = await getBattleHistoryPage({ offset, limit });
    return NextResponse.json(page);
  } catch (error) {
    console.error('Failed to load battle history', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to load battle history'),
      { status: 500 },
    );
  }
}
