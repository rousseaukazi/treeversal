import { NextRequest, NextResponse } from 'next/server';
import { getAccountByRiotId, getSummonerByPuuid, getDDragonVersion, getProfileIconUrl } from '@/lib/riot';
import { isDemoMode, getDemoAccount } from '@/lib/demoData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: 'gameName and tagLine are required' },
      { status: 400 }
    );
  }

  // Demo mode — return mock data when no API key is set
  if (isDemoMode()) {
    return NextResponse.json(getDemoAccount());
  }

  try {
    const account = await getAccountByRiotId(gameName, tagLine);
    const [summoner, version] = await Promise.all([
      getSummonerByPuuid(account.puuid),
      getDDragonVersion(),
    ]);

    return NextResponse.json({
      ...account,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      profileIconUrl: getProfileIconUrl(version, summoner.profileIconId),
      ddragonVersion: version,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.includes('404') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
