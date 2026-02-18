import { NextRequest, NextResponse } from 'next/server';
import { getMatchIds, getMatchById, getDDragonVersion } from '@/lib/riot';
import type { MatchData } from '@/lib/riot';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const puuid = searchParams.get('puuid');
  const count = parseInt(searchParams.get('count') || '20', 10);
  const start = parseInt(searchParams.get('start') || '0', 10);

  if (!puuid) {
    return NextResponse.json(
      { error: 'puuid is required' },
      { status: 400 }
    );
  }

  if (!process.env.RIOT_API_KEY || process.env.RIOT_API_KEY === 'RGAPI-your-key-here') {
    return NextResponse.json(
      { error: 'RIOT_API_KEY is not configured. Get one at https://developer.riotgames.com/' },
      { status: 500 }
    );
  }

  try {
    const [matchIds, version] = await Promise.all([
      getMatchIds(puuid, count, start),
      getDDragonVersion(),
    ]);

    // Fetch match details in parallel (batch of 5 to respect rate limits)
    const matches: MatchData[] = [];
    const batchSize = 5;
    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((id) => getMatchById(id).catch(() => null))
      );
      matches.push(...batchResults.filter((m): m is MatchData => m !== null));
    }

    return NextResponse.json({
      matchIds,
      matches,
      ddragonVersion: version,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
