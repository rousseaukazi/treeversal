import { NextRequest, NextResponse } from 'next/server';
import { getMatchIds, getMatchById, getDDragonVersion } from '@/lib/riot';
import { isDemoMode, getDemoMatches } from '@/lib/demoData';
import type { MatchData } from '@/lib/riot';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const puuid = searchParams.get('puuid');

  if (!puuid) {
    return NextResponse.json(
      { error: 'puuid is required' },
      { status: 400 }
    );
  }

  // Demo mode — return mock data when no API key is set
  if (isDemoMode()) {
    return NextResponse.json(getDemoMatches());
  }

  const count = parseInt(searchParams.get('count') || '20', 10);
  const start = parseInt(searchParams.get('start') || '0', 10);

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
