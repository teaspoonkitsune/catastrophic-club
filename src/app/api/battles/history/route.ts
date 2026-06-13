import { NextResponse } from 'next/server';
import {
  getBattleHistoryPage,
  getLatestBattleHistoryEntryId,
} from '@/entities/battle-cat/api/repository';
import { getAuthSession } from '@/shared/auth';
import { createHttpCatErrorPayload } from '@/shared/lib/http-cat';
import { createLogger } from '@/shared/lib/logger';

const logger = createLogger('api.battles.history');

function parsePositiveInteger(value: string | null, fallback: number, maxValue: number) {
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
    const headId = url.searchParams.get('headId');
    const cursor = url.searchParams.get('cursor');
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
        cursor,
        limit,
      });

      return NextResponse.json(page);
    }

    if (!cursor && headId) {
      const latestId = await getLatestBattleHistoryEntryId();

      if (latestId === headId) {
        logger.debug('battles.history_unchanged', { scope });
        return NextResponse.json({
          changed: false,
          latestId,
        });
      }
    }

    const page = await getBattleHistoryPage({ cursor, limit });

    if (cursor) {
      return NextResponse.json(page);
    }

    return NextResponse.json({
      changed: true,
      latestId: page.items[0]?.id ?? null,
      page,
    });
  } catch (error) {
    logger.error('battles.history_load_failed', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to load battle history'),
      { status: 500 },
    );
  }
}
