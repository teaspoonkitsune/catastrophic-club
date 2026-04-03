import { NextResponse } from 'next/server';
import { getBattlePair, recordBattleResult } from '@/entities/battle-cat/api/repository';
import { createHttpCatErrorPayload } from '@/shared/lib/http-cat';

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
    return NextResponse.json({ pair: pair.map(toBattleRecord) });
  } catch (error) {
    console.error('Failed to load battle pair', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to load battle pair'),
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<{
      winnerId: string;
      loserId: string;
    }>;

    if (!body.winnerId || !body.loserId || body.winnerId === body.loserId) {
      return NextResponse.json(createHttpCatErrorPayload(400, 'Invalid battle result'), { status: 400 });
    }

    await recordBattleResult({
      winnerId: body.winnerId,
      loserId: body.loserId,
    });

    const pair = await getBattlePair();
    return NextResponse.json({ pair: pair.map(toBattleRecord) });
  } catch (error) {
    console.error('Failed to save battle result', error);
    return NextResponse.json(
      createHttpCatErrorPayload(500, 'Failed to save battle result'),
      { status: 500 },
    );
  }
}
