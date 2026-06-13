import { NextResponse } from 'next/server';
import { getBattlePair, recordBattleResult } from '@/entities/battle-cat/api/repository';
import { getAuthSession } from '@/shared/auth';
import { createHttpCatErrorPayload } from '@/shared/lib/http-cat';
import { createLogger } from '@/shared/lib/logger';

const logger = createLogger('api.battles');

function toBattleRecord(cat: Awaited<ReturnType<typeof getBattlePair>>[number]) {
  return {
    id: cat.id,
    imageUrl: cat.imageUrl,
    score: cat.score,
  };
}

export async function GET() {
  try {
    const pair = await getBattlePair();
    logger.debug('battles.pair_loaded', { count: pair.length });
    return NextResponse.json({ pair: pair.map(toBattleRecord) });
  } catch (error) {
    logger.error('battles.pair_load_failed', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to load battle pair'),
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json(
        createHttpCatErrorPayload(401, 'Authentication required'),
        { status: 401 },
      );
    }

    const body = (await request.json()) as Partial<{
      winnerId: string;
      loserId: string;
    }>;

    if (!body.winnerId || !body.loserId || body.winnerId === body.loserId) {
      return NextResponse.json(
        createHttpCatErrorPayload(400, 'Invalid battle result'),
        { status: 400 },
      );
    }

    const historyEntry = await recordBattleResult({
      winnerId: body.winnerId,
      loserId: body.loserId,
      userId: session.user.subject,
    });

    if (!historyEntry) {
      logger.warn('battles.vote_rate_limited', {
        subject: session.user.subject,
      });
      return NextResponse.json(
        createHttpCatErrorPayload(429, 'Daily battle vote limit exceeded'),
        { status: 429 },
      );
    }

    const pair = await getBattlePair();
    logger.info('battles.vote_recorded', {
      subject: session.user.subject,
      winnerId: body.winnerId,
      loserId: body.loserId,
      historyEntryId: historyEntry.id,
    });
    return NextResponse.json({ pair: pair.map(toBattleRecord), historyEntry });
  } catch (error) {
    logger.error('battles.vote_failed', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to save battle result'),
      { status: 500 },
    );
  }
}
