// Realistic demo match data for IZAKR#NA2
// Used when RIOT_API_KEY is not configured

import type { MatchData } from './riot';

const DEMO_PUUID = 'demo-puuid-izakr-na2-0000000000000000000000000000000000000000';

const DEMO_ACCOUNT = {
  puuid: DEMO_PUUID,
  gameName: 'IZAKR',
  tagLine: 'NA2',
  summonerLevel: 247,
  profileIconId: 5367,
  profileIconUrl: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/5367.png',
  ddragonVersion: '14.24.1',
  isDemo: true,
};

function makeParticipant(
  overrides: Partial<{
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
    items: number[];
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
    teamId: number;
    teamPosition: string;
  }>
) {
  return {
    puuid: overrides.puuid || `demo-${Math.random().toString(36).slice(2)}`,
    summonerName: overrides.summonerName || overrides.riotIdGameName || 'Player',
    riotIdGameName: overrides.riotIdGameName || overrides.summonerName || 'Player',
    riotIdTagline: overrides.riotIdTagline || 'NA1',
    championName: overrides.championName || 'Jinx',
    championId: overrides.championId || 222,
    champLevel: overrides.champLevel || 16,
    kills: overrides.kills ?? 5,
    deaths: overrides.deaths ?? 3,
    assists: overrides.assists ?? 7,
    item0: overrides.items?.[0] ?? 3031,
    item1: overrides.items?.[1] ?? 3006,
    item2: overrides.items?.[2] ?? 3094,
    item3: overrides.items?.[3] ?? 3085,
    item4: overrides.items?.[4] ?? 3072,
    item5: overrides.items?.[5] ?? 0,
    item6: overrides.items?.[6] ?? 3340,
    summoner1Id: overrides.summoner1Id ?? 4,
    summoner2Id: overrides.summoner2Id ?? 7,
    win: overrides.win ?? true,
    totalDamageDealtToChampions: overrides.totalDamageDealtToChampions ?? 18500,
    totalDamageTaken: overrides.totalDamageTaken ?? 14200,
    goldEarned: overrides.goldEarned ?? 12800,
    totalMinionsKilled: overrides.totalMinionsKilled ?? 185,
    neutralMinionsKilled: overrides.neutralMinionsKilled ?? 12,
    visionScore: overrides.visionScore ?? 22,
    wardsPlaced: overrides.wardsPlaced ?? 8,
    wardsKilled: overrides.wardsKilled ?? 3,
    doubleKills: 1,
    tripleKills: 0,
    quadraKills: 0,
    pentaKills: 0,
    totalHealsOnTeammates: 0,
    teamId: overrides.teamId ?? 100,
    role: 'CARRY',
    teamPosition: overrides.teamPosition || 'BOTTOM',
    individualPosition: overrides.teamPosition || 'BOTTOM',
  };
}

const champions = [
  'Jinx', 'Yasuo', 'Lux', 'LeeSin', 'Thresh', 'Ahri', 'Ezreal', 'Kaisa',
  'Zed', 'Vayne', 'Darius', 'Morgana', 'Blitzcrank', 'MasterYi', 'Caitlyn',
  'Jhin', 'Senna', 'Viktor', 'Syndra', 'Viego', 'Yone', 'Ksante', 'Graves',
  'Nautilus', 'Orianna', 'Renekton', 'Sejuani', 'Aphelios', 'Lulu', 'Rumble',
];

const playerNames = [
  'IZAKR', 'DarkStar99', 'xXSniperXx', 'MidOrFeed', 'JungleDiff',
  'Support4Life', 'TopGapGG', 'ADCarryMe', 'BaronStealer', 'FlashOnD',
  'Pentakill420', 'WardJungle', 'LastHitKing', 'RiftHerald', 'DragonSoul',
  'TowerDiver', 'MinionSlayer', 'GankCity', 'LateGameCarry', 'FirstBlood',
];

const positions = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];

// Common item builds per role
const itemBuilds: Record<string, number[][]> = {
  ADC: [
    [3031, 3006, 3094, 3085, 3072, 0, 3340],
    [6672, 3006, 3085, 3031, 3036, 0, 3363],
    [3031, 3094, 3085, 3072, 3036, 3006, 3340],
  ],
  MID: [
    [3089, 3020, 3165, 3135, 3157, 0, 3340],
    [6653, 3020, 3089, 3135, 3116, 0, 3363],
    [3100, 3020, 3089, 3135, 3157, 3165, 3340],
  ],
  TOP: [
    [3078, 3047, 3053, 3071, 3193, 0, 3340],
    [6630, 3047, 3053, 3071, 3193, 0, 3340],
    [3078, 3111, 3748, 3193, 3053, 0, 3340],
  ],
  JG: [
    [6672, 3006, 3071, 3053, 3193, 0, 3340],
    [3078, 3047, 3053, 3071, 3193, 0, 3364],
    [6653, 3020, 3157, 3165, 3089, 0, 3364],
  ],
  SUP: [
    [3853, 3009, 3107, 3011, 3222, 0, 3364],
    [3862, 3009, 3190, 3109, 3222, 0, 3364],
    [3858, 3020, 3157, 3165, 3116, 0, 3364],
  ],
};

const roleForPosition: Record<string, string> = {
  TOP: 'TOP',
  JUNGLE: 'JG',
  MIDDLE: 'MID',
  BOTTOM: 'ADC',
  UTILITY: 'SUP',
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMatch(index: number, playerWin: boolean): MatchData {
  const now = Date.now();
  const timeAgo = index * 3600000 * randomInt(1, 6) + randomInt(0, 1800000);
  const gameDuration = randomInt(1200, 2400); // 20-40 minutes
  const queueIds = [420, 420, 420, 440, 400, 450]; // weighted toward ranked
  const queueId = pickRandom(queueIds);

  const usedChampions = new Set<string>();
  const usedNames = new Set<string>();
  usedNames.add('IZAKR');

  function getUniqueChamp(): string {
    let c: string;
    do { c = pickRandom(champions); } while (usedChampions.has(c));
    usedChampions.add(c);
    return c;
  }

  function getUniqueName(): string {
    let n: string;
    do { n = pickRandom(playerNames); } while (usedNames.has(n));
    usedNames.add(n);
    return n;
  }

  // Player is always on team 100
  const playerChamp = getUniqueChamp();
  const playerPos = pickRandom(['BOTTOM', 'MIDDLE', 'BOTTOM', 'BOTTOM', 'JUNGLE']);
  const playerRole = roleForPosition[playerPos] || 'ADC';
  const playerItems = pickRandom(itemBuilds[playerRole] || itemBuilds.ADC);

  const participants = [];

  // Player (team 100)
  participants.push(
    makeParticipant({
      puuid: DEMO_PUUID,
      riotIdGameName: 'IZAKR',
      riotIdTagline: 'NA2',
      championName: playerChamp,
      champLevel: randomInt(14, 18),
      kills: playerWin ? randomInt(4, 15) : randomInt(1, 8),
      deaths: playerWin ? randomInt(1, 6) : randomInt(3, 10),
      assists: randomInt(3, 14),
      items: playerItems,
      summoner1Id: 4,
      summoner2Id: playerPos === 'JUNGLE' ? 11 : pickRandom([7, 14, 3, 21]),
      win: playerWin,
      totalDamageDealtToChampions: randomInt(12000, 38000),
      totalDamageTaken: randomInt(10000, 28000),
      goldEarned: randomInt(9000, 16000),
      totalMinionsKilled: randomInt(120, 280),
      neutralMinionsKilled: playerPos === 'JUNGLE' ? randomInt(100, 180) : randomInt(5, 25),
      visionScore: randomInt(12, 45),
      teamId: 100,
      teamPosition: playerPos,
    })
  );

  // Rest of team 100 (4 allies)
  const remainingPositions100 = positions.filter((p) => p !== playerPos);
  for (const pos of remainingPositions100) {
    const role = roleForPosition[pos] || 'ADC';
    participants.push(
      makeParticipant({
        riotIdGameName: getUniqueName(),
        championName: getUniqueChamp(),
        champLevel: randomInt(12, 18),
        kills: randomInt(1, 12),
        deaths: randomInt(1, 9),
        assists: randomInt(2, 15),
        items: pickRandom(itemBuilds[role] || itemBuilds.ADC),
        summoner1Id: 4,
        summoner2Id: pos === 'JUNGLE' ? 11 : pickRandom([7, 14, 3, 12, 21]),
        win: playerWin,
        totalDamageDealtToChampions: randomInt(8000, 32000),
        totalDamageTaken: randomInt(8000, 30000),
        goldEarned: randomInt(7000, 15000),
        totalMinionsKilled: randomInt(60, 260),
        neutralMinionsKilled: pos === 'JUNGLE' ? randomInt(100, 180) : randomInt(0, 20),
        visionScore: randomInt(8, 50),
        teamId: 100,
        teamPosition: pos,
      })
    );
  }

  // Team 200 (5 enemies)
  for (const pos of positions) {
    const role = roleForPosition[pos] || 'ADC';
    participants.push(
      makeParticipant({
        riotIdGameName: getUniqueName(),
        championName: getUniqueChamp(),
        champLevel: randomInt(12, 18),
        kills: !playerWin ? randomInt(3, 13) : randomInt(1, 8),
        deaths: !playerWin ? randomInt(1, 6) : randomInt(3, 10),
        assists: randomInt(2, 15),
        items: pickRandom(itemBuilds[role] || itemBuilds.ADC),
        summoner1Id: 4,
        summoner2Id: pos === 'JUNGLE' ? 11 : pickRandom([7, 14, 3, 12, 21]),
        win: !playerWin,
        totalDamageDealtToChampions: randomInt(8000, 32000),
        totalDamageTaken: randomInt(8000, 30000),
        goldEarned: randomInt(7000, 15000),
        totalMinionsKilled: randomInt(60, 260),
        neutralMinionsKilled: pos === 'JUNGLE' ? randomInt(100, 180) : randomInt(0, 20),
        visionScore: randomInt(8, 50),
        teamId: 200,
        teamPosition: pos,
      })
    );
  }

  return {
    metadata: {
      dataVersion: '2',
      matchId: `NA1_${5000000000 - index}`,
      participants: participants.map((p) => p.puuid),
    },
    info: {
      gameCreation: now - timeAgo - gameDuration * 1000,
      gameDuration,
      gameEndTimestamp: now - timeAgo,
      gameId: 5000000000 - index,
      gameMode: queueId === 450 ? 'ARAM' : 'CLASSIC',
      gameName: `Game ${index + 1}`,
      gameType: 'MATCHED_GAME',
      gameVersion: '14.24.1',
      mapId: queueId === 450 ? 12 : 11,
      participants,
      queueId,
      teams: [
        {
          teamId: 100,
          win: playerWin,
          bans: [],
          objectives: {
            baron: { first: playerWin, kills: playerWin ? 1 : 0 },
            dragon: { first: true, kills: randomInt(1, 4) },
            tower: { first: true, kills: randomInt(3, 11) },
          },
        },
        {
          teamId: 200,
          win: !playerWin,
          bans: [],
          objectives: {
            baron: { first: !playerWin, kills: !playerWin ? 1 : 0 },
            dragon: { first: false, kills: randomInt(0, 3) },
            tower: { first: false, kills: randomInt(1, 8) },
          },
        },
      ],
    },
  };
}

// Generate 20 matches with ~55% win rate
function generateDemoMatches(): MatchData[] {
  const winPattern = [
    true, true, false, true, false,
    true, false, true, true, false,
    false, true, true, false, true,
    false, true, false, true, true,
  ];
  return winPattern.map((win, i) => generateMatch(i, win));
}

// Cache so demo data is consistent within a session
let cachedMatches: MatchData[] | null = null;

export function getDemoAccount() {
  return DEMO_ACCOUNT;
}

export function getDemoMatches() {
  if (!cachedMatches) {
    cachedMatches = generateDemoMatches();
  }
  return {
    matchIds: cachedMatches.map((m) => m.metadata.matchId),
    matches: cachedMatches,
    ddragonVersion: '14.24.1',
    isDemo: true,
  };
}

export function isDemoMode(): boolean {
  return !process.env.RIOT_API_KEY || process.env.RIOT_API_KEY === 'RGAPI-your-key-here';
}
