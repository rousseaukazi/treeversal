'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  getChampionIconUrl,
  getItemIconUrl,
  getSummonerSpellIconUrl,
  getQueueName,
} from '@/lib/riot';
import type { MatchData } from '@/lib/riot';

// ---- Types for API responses ----

interface AccountData {
  puuid: string;
  gameName: string;
  tagLine: string;
  summonerLevel: number;
  profileIconId: number;
  profileIconUrl: string;
  ddragonVersion: string;
  isDemo?: boolean;
}

interface MatchesResponseExt {
  matchIds: string[];
  matches: MatchData[];
  ddragonVersion: string;
  isDemo?: boolean;
}

// ---- Helper functions ----

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function getKDA(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
}

function getCsPerMin(cs: number, durationSeconds: number): string {
  return (cs / (durationSeconds / 60)).toFixed(1);
}

// ---- Components ----

function ItemSlot({ version, itemId }: { version: string; itemId: number }) {
  const url = getItemIconUrl(version, itemId);
  if (!url) {
    return (
      <div className="w-7 h-7 bg-gray-800 rounded border border-gray-700" />
    );
  }
  return (
    <Image
      src={url}
      alt={`Item ${itemId}`}
      width={28}
      height={28}
      className="rounded border border-gray-700"
    />
  );
}

function SpellIcon({ version, spellId }: { version: string; spellId: number }) {
  const url = getSummonerSpellIconUrl(version, spellId);
  if (!url) {
    return <div className="w-7 h-7 bg-gray-800 rounded" />;
  }
  return (
    <Image
      src={url}
      alt={`Spell ${spellId}`}
      width={28}
      height={28}
      className="rounded"
    />
  );
}

function MatchCard({
  match,
  puuid,
  version,
}: {
  match: MatchData;
  puuid: string;
  version: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const player = match.info.participants.find((p) => p.puuid === puuid);
  if (!player) return null;

  const isWin = player.win;
  const cs = player.totalMinionsKilled + player.neutralMinionsKilled;

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all ${
        isWin
          ? 'border-blue-500/40 bg-blue-950/30'
          : 'border-red-500/40 bg-red-950/30'
      }`}
    >
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 sm:p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Win/Loss indicator */}
          <div
            className={`w-1 h-16 rounded-full flex-shrink-0 ${
              isWin ? 'bg-blue-500' : 'bg-red-500'
            }`}
          />

          {/* Champion icon */}
          <div className="relative flex-shrink-0">
            <Image
              src={getChampionIconUrl(version, player.championName)}
              alt={player.championName}
              width={48}
              height={48}
              className="rounded-lg"
            />
            <span className="absolute -bottom-1 -right-1 bg-gray-900 text-xs px-1 rounded text-gray-300 border border-gray-700">
              {player.champLevel}
            </span>
          </div>

          {/* Summoner spells */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <SpellIcon version={version} spellId={player.summoner1Id} />
            <SpellIcon version={version} spellId={player.summoner2Id} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-semibold ${
                  isWin ? 'text-blue-400' : 'text-red-400'
                }`}
              >
                {isWin ? 'Victory' : 'Defeat'}
              </span>
              <span className="text-xs text-gray-400">
                {getQueueName(match.info.queueId)}
              </span>
              <span className="text-xs text-gray-500">
                {formatDuration(match.info.gameDuration)}
              </span>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(match.info.gameEndTimestamp)}
              </span>
            </div>

            {/* KDA */}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white font-medium text-sm">
                {player.kills}
                <span className="text-gray-500">/</span>
                <span className="text-red-400">{player.deaths}</span>
                <span className="text-gray-500">/</span>
                {player.assists}
              </span>
              <span className="text-xs text-gray-400">
                {getKDA(player.kills, player.deaths, player.assists)} KDA
              </span>
              <span className="text-xs text-gray-500">
                {cs} CS ({getCsPerMin(cs, match.info.gameDuration)}/min)
              </span>
            </div>

            {/* Items */}
            <div className="flex gap-0.5 mt-2">
              {[player.item0, player.item1, player.item2, player.item3, player.item4, player.item5].map(
                (itemId, i) => (
                  <ItemSlot key={i} version={version} itemId={itemId} />
                )
              )}
              <div className="ml-1">
                <ItemSlot version={version} itemId={player.item6} />
              </div>
            </div>
          </div>

          {/* Damage stats (desktop) */}
          <div className="hidden sm:flex flex-col items-end text-xs text-gray-400 flex-shrink-0">
            <span>
              <span className="text-gray-300">{player.totalDamageDealtToChampions.toLocaleString()}</span> dmg
            </span>
            <span>
              <span className="text-gray-300">{player.goldEarned.toLocaleString()}</span> gold
            </span>
            <span>
              <span className="text-gray-300">{player.visionScore}</span> vision
            </span>
          </div>

          {/* Expand indicator */}
          <span className="text-gray-500 flex-shrink-0">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Expanded: all participants */}
      {expanded && (
        <div className="border-t border-gray-700/50 p-3">
          {[100, 200].map((teamId) => {
            const team = match.info.participants.filter(
              (p) => p.teamId === teamId
            );
            const teamWin = team[0]?.win;
            return (
              <div key={teamId} className="mb-3 last:mb-0">
                <div
                  className={`text-xs font-semibold mb-1 ${
                    teamWin ? 'text-blue-400' : 'text-red-400'
                  }`}
                >
                  {teamWin ? 'Victory' : 'Defeat'} — {teamId === 100 ? 'Blue' : 'Red'} Team
                </div>
                <div className="space-y-1">
                  {team.map((p) => (
                    <div
                      key={p.puuid}
                      className={`flex items-center gap-2 text-xs py-1 px-2 rounded ${
                        p.puuid === puuid
                          ? 'bg-white/10 ring-1 ring-white/20'
                          : ''
                      }`}
                    >
                      <Image
                        src={getChampionIconUrl(version, p.championName)}
                        alt={p.championName}
                        width={24}
                        height={24}
                        className="rounded"
                      />
                      <span className="text-gray-300 w-28 truncate">
                        {p.riotIdGameName || p.summonerName}
                      </span>
                      <span className="text-white font-medium w-16">
                        {p.kills}/{p.deaths}/{p.assists}
                      </span>
                      <span className="text-gray-500 w-12">
                        {getKDA(p.kills, p.deaths, p.assists)}
                      </span>
                      <span className="text-gray-400 w-14">
                        {(p.totalMinionsKilled + p.neutralMinionsKilled)} CS
                      </span>
                      <span className="text-gray-500 hidden sm:inline w-16">
                        {p.totalDamageDealtToChampions.toLocaleString()} dmg
                      </span>
                      <span className="text-gray-500 hidden sm:inline w-14">
                        {p.goldEarned.toLocaleString()} g
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Main Page ----

export default function LoLDashboard() {
  const [gameName, setGameName] = useState('IZAKR');
  const [tagLine, setTagLine] = useState('NA2');
  const [account, setAccount] = useState<AccountData | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [ddragonVersion, setDdragonVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const lookupAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAccount(null);
    setMatches([]);

    try {
      const res = await fetch(
        `/api/riot/account?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAccount(data);
      setDdragonVersion(data.ddragonVersion);
      if (data.isDemo) setIsDemo(true);

      // Now fetch matches
      setLoadingMatches(true);
      const matchRes = await fetch(
        `/api/riot/matches?puuid=${encodeURIComponent(data.puuid)}&count=20`
      );
      const matchData: MatchesResponseExt = await matchRes.json();
      if (!matchRes.ok) throw new Error((matchData as unknown as { error: string }).error);

      setMatches(matchData.matches);
      setDdragonVersion(matchData.ddragonVersion);
      if (matchData.isDemo) setIsDemo(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingMatches(false);
    }
  }, [gameName, tagLine]);

  // Compute stats
  const wins = matches.filter(
    (m) => m.info.participants.find((p) => p.puuid === account?.puuid)?.win
  ).length;
  const losses = matches.length - wins;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/lol" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LoL Dashboard
            </span>
          </a>
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Back to Treecognition
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Demo Banner */}
        {isDemo && (
          <div className="bg-amber-950/50 border border-amber-500/40 rounded-lg p-3 mb-6 text-amber-300 text-sm">
            <strong>Demo Mode</strong> — Showing simulated match data. To see real data, add your{' '}
            <a
              href="https://developer.riotgames.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-200"
            >
              Riot API key
            </a>{' '}
            as the <code className="bg-amber-900/50 px-1 rounded text-xs">RIOT_API_KEY</code> environment variable.
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Game History Lookup</h1>
          <div className="flex gap-2 items-end flex-wrap">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Game Name
              </label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="IZAKR"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Tag Line
              </label>
              <input
                type="text"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                placeholder="NA2"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              />
            </div>
            <button
              onClick={lookupAccount}
              disabled={loading || !gameName || !tagLine}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 px-5 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
            {error.includes('RIOT_API_KEY') && (
              <p className="text-xs mt-2 text-red-400">
                Add your API key to <code className="bg-red-900/50 px-1 rounded">.env.local</code> and restart the dev server.
              </p>
            )}
          </div>
        )}

        {/* Profile Card */}
        {account && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6 flex items-center gap-4">
            <Image
              src={account.profileIconUrl}
              alt="Profile Icon"
              width={64}
              height={64}
              className="rounded-lg border-2 border-gray-700"
            />
            <div>
              <h2 className="text-xl font-bold">
                {account.gameName}
                <span className="text-gray-500 font-normal">
                  #{account.tagLine}
                </span>
              </h2>
              <p className="text-sm text-gray-400">
                Level {account.summonerLevel}
              </p>
            </div>
            {matches.length > 0 && (
              <div className="ml-auto text-right">
                <div className="text-sm">
                  <span className="text-blue-400 font-medium">{wins}W</span>
                  {' '}
                  <span className="text-red-400 font-medium">{losses}L</span>
                </div>
                <div className="text-xs text-gray-400">
                  Last {matches.length} games —{' '}
                  {matches.length > 0
                    ? Math.round((wins / matches.length) * 100)
                    : 0}
                  % WR
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading matches indicator */}
        {loadingMatches && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-400">Loading match history...</p>
            <p className="text-xs text-gray-500 mt-1">
              Fetching details for each match (this may take a moment)
            </p>
          </div>
        )}

        {/* Match List */}
        {matches.length > 0 && account && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Recent Matches</h3>
            <div className="space-y-2">
              {matches.map((match) => (
                <MatchCard
                  key={match.metadata.matchId}
                  match={match}
                  puuid={account.puuid}
                  version={ddragonVersion}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !loadingMatches && !account && !error && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">Enter a Riot ID to look up match history</p>
            <p className="text-sm">
              Example: <strong className="text-gray-400">IZAKR</strong>
              <span className="text-gray-600">#</span>
              <strong className="text-gray-400">NA2</strong>
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-gray-600">
          <p>
            Powered by{' '}
            <a
              href="https://developer.riotgames.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-400"
            >
              Riot Games API
            </a>
            . Not endorsed by Riot Games.
          </p>
        </div>
      </footer>
    </div>
  );
}
