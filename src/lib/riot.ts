// Riot Games API utility functions
// Documentation: https://developer.riotgames.com/docs/lol

const RIOT_API_KEY = process.env.RIOT_API_KEY || '';

// Regional routing for account-v1 and match-v5
const AMERICAS_HOST = 'https://americas.api.riotgames.com';
// Platform routing for summoner-v4, league-v4, etc.
const NA1_HOST = 'https://na1.api.riotgames.com';

// Data Dragon CDN for champion/item/spell images
const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';

const headers = {
  'X-Riot-Token': RIOT_API_KEY,
};

// ---- Types ----

export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface SummonerInfo {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface MatchParticipant {
  puuid: string;
  summonerName: string;
  riotIdGameName: string;
  riotIdTagline: string;
  championName: string;
  championId: number;
  champLevel: number;
  kills: number;
  deaths: number;
  assists: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number; // trinket
  summoner1Id: number;
  summoner2Id: number;
  win: boolean;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  goldEarned: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
  totalHealsOnTeammates: number;
  teamId: number;
  role: string;
  teamPosition: string;
  individualPosition: string;
}

export interface MatchInfo {
  gameCreation: number;
  gameDuration: number;
  gameEndTimestamp: number;
  gameId: number;
  gameMode: string;
  gameName: string;
  gameType: string;
  gameVersion: string;
  mapId: number;
  participants: MatchParticipant[];
  queueId: number;
  teams: Array<{
    teamId: number;
    win: boolean;
    bans: Array<{ championId: number; pickTurn: number }>;
    objectives: Record<string, { first: boolean; kills: number }>;
  }>;
}

export interface MatchData {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: MatchInfo;
}

// ---- API Functions ----

async function riotFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers, next: { revalidate: 300 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Riot API error ${res.status}: ${text}`);
  }
  return res.json();
}

/** Look up a Riot account by gameName#tagLine → PUUID */
export async function getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotAccount> {
  return riotFetch<RiotAccount>(
    `${AMERICAS_HOST}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );
}

/** Get summoner info by PUUID (for profile icon, level, etc.) */
export async function getSummonerByPuuid(puuid: string): Promise<SummonerInfo> {
  return riotFetch<SummonerInfo>(
    `${NA1_HOST}/lol/summoner/v4/summoners/by-puuid/${puuid}`
  );
}

/** Get list of match IDs for a given PUUID */
export async function getMatchIds(puuid: string, count: number = 20, start: number = 0): Promise<string[]> {
  return riotFetch<string[]>(
    `${AMERICAS_HOST}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`
  );
}

/** Get full match data by match ID */
export async function getMatchById(matchId: string): Promise<MatchData> {
  return riotFetch<MatchData>(
    `${AMERICAS_HOST}/lol/match/v5/matches/${matchId}`
  );
}

// ---- Data Dragon Helpers ----

let cachedVersion: string | null = null;

/** Get the latest Data Dragon version */
export async function getDDragonVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;
  const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
  const versions: string[] = await res.json();
  cachedVersion = versions[0];
  return cachedVersion;
}

/** Get champion square icon URL */
export function getChampionIconUrl(version: string, championName: string): string {
  return `${DDRAGON_BASE}/cdn/${version}/img/champion/${championName}.png`;
}

/** Get item icon URL (itemId 0 means empty slot) */
export function getItemIconUrl(version: string, itemId: number): string | null {
  if (itemId === 0) return null;
  return `${DDRAGON_BASE}/cdn/${version}/img/item/${itemId}.png`;
}

/** Get profile icon URL */
export function getProfileIconUrl(version: string, iconId: number): string {
  return `${DDRAGON_BASE}/cdn/${version}/img/profileicon/${iconId}.png`;
}

// Summoner spell ID → key mapping (these rarely change)
const SUMMONER_SPELL_MAP: Record<number, string> = {
  1: 'SummonerBoost',       // Cleanse
  3: 'SummonerExhaust',     // Exhaust
  4: 'SummonerFlash',       // Flash
  6: 'SummonerHaste',       // Ghost
  7: 'SummonerHeal',        // Heal
  11: 'SummonerSmite',      // Smite
  12: 'SummonerTeleport',   // Teleport
  13: 'SummonerMana',       // Clarity
  14: 'SummonerDot',        // Ignite
  21: 'SummonerBarrier',    // Barrier
  30: 'SummonerPoroRecall', // To the King (ARAM)
  31: 'SummonerPoroThrow',  // Poro Toss (ARAM)
  32: 'SummonerSnowball',   // Mark (ARAM)
  39: 'SummonerSnowURFSnowball_Mark', // Mark (URF)
  54: 'Summoner_UltBookPlaceholder',  // Placeholder
  55: 'Summoner_UltBookSmitePlaceholder', // Placeholder
};

/** Get summoner spell icon URL */
export function getSummonerSpellIconUrl(version: string, spellId: number): string | null {
  const key = SUMMONER_SPELL_MAP[spellId];
  if (!key) return null;
  return `${DDRAGON_BASE}/cdn/${version}/img/spell/${key}.png`;
}

// Queue ID → readable name mapping
export const QUEUE_MAP: Record<number, string> = {
  0: 'Custom',
  400: 'Normal Draft',
  420: 'Ranked Solo/Duo',
  430: 'Normal Blind',
  440: 'Ranked Flex',
  450: 'ARAM',
  700: 'Clash',
  720: 'ARAM Clash',
  900: 'URF',
  1020: 'One for All',
  1300: 'Nexus Blitz',
  1400: 'Ultimate Spellbook',
  1700: 'Arena',
  1900: 'Pick URF',
};

/** Get human-readable queue name */
export function getQueueName(queueId: number): string {
  return QUEUE_MAP[queueId] || `Queue ${queueId}`;
}
