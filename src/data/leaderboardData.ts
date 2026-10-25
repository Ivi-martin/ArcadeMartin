import { LeaderboardEntry } from '../types/game';

export const INITIAL_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'Vortex_Master', score: 14850, level: 30, world: 3, avatar: '👑', country: 'ES', date: '2026-10-23', badge: 'TOP 1' },
  { id: '2', name: 'CyberKunoichi', score: 12400, level: 29, world: 3, avatar: '⚡', country: 'MX', date: '2026-10-22', badge: 'TOP 2' },
  { id: '3', name: 'RetroTitan', score: 10920, level: 28, world: 3, avatar: '🔥', country: 'AR', date: '2026-10-21', badge: 'TOP 3' },
  { id: '4', name: 'MartinFan99', score: 9450, level: 25, world: 3, avatar: '⭐', country: 'ES', date: '2026-10-24' },
  { id: '5', name: 'ShadowStriker', score: 8600, level: 22, world: 3, avatar: '🗡️', country: 'CO', date: '2026-10-20' },
  { id: '6', name: 'PixelSamurai', score: 7850, level: 20, world: 2, avatar: '🥷', country: 'CL', date: '2026-10-24' },
  { id: '7', name: 'DeepSeaDiver', score: 6920, level: 18, world: 2, avatar: '🐙', country: 'PE', date: '2026-10-23' },
  { id: '8', name: 'ForestGuardian', score: 5800, level: 15, world: 2, avatar: '🌲', country: 'ES', date: '2026-10-22' },
  { id: '9', name: 'NeonRider', score: 4650, level: 12, world: 2, avatar: '🚀', country: 'UY', date: '2026-10-19' },
  { id: '10', name: 'ArcadeBeast', score: 3900, level: 10, world: 1, avatar: '🐲', country: 'ES', date: '2026-10-24' },
];

export const INITIAL_FRIENDS_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'f1', name: 'AlexPro_99', score: 8400, level: 21, world: 3, avatar: '🔥', country: 'ES', date: 'Hoy' },
  { id: 'f2', name: 'Sofi_Gamer', score: 6200, level: 16, world: 2, avatar: '⭐', country: 'ES', date: 'Ayer' },
  { id: 'f3', name: 'David_Pixel', score: 4850, level: 13, world: 2, avatar: '🎮', country: 'ES', date: 'Hace 2d' },
  { id: 'f4', name: 'ElenaSpeed', score: 3400, level: 9, world: 1, avatar: '⚡', country: 'ES', date: 'Hace 3d' },
  { id: 'f5', name: 'LucasRetro', score: 2100, level: 6, world: 1, avatar: '👾', country: 'ES', date: 'Hace 5d' },
];

export const AVATAR_OPTIONS = ['🥷', '⭐', '🔥', '⚡', '👑', '🐙', '👾', '🚀', '🐲', '🎮', '💀', '💎'];

const LEADERBOARD_STORAGE_KEY = 'arcade_martin_global_leaderboard';
const FRIENDS_STORAGE_KEY = 'arcade_martin_friends_leaderboard';

export function getStoredLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_GLOBAL_LEADERBOARD;
}

export function getStoredFriendsLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_FRIENDS_LEADERBOARD;
}

export function saveScoreToLeaderboard(
  playerName: string,
  score: number,
  level: number,
  avatar: string
): { globalRank: number; friendsRank: number } {
  if (score <= 0) return { globalRank: -1, friendsRank: -1 };

  const world = level > 20 ? 3 : level > 10 ? 2 : 1;
  const today = new Date().toISOString().split('T')[0];

  // Update Global
  const globalList = getStoredLeaderboard().filter((e) => !e.isPlayer);
  const playerEntry: LeaderboardEntry = {
    id: 'player_me',
    name: playerName || 'Martín Master',
    score,
    level,
    world,
    avatar,
    isPlayer: true,
    country: 'ES',
    date: today,
  };

  const updatedGlobal = [...globalList, playerEntry].sort((a, b) => b.score - a.score);
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updatedGlobal));
  const globalRank = updatedGlobal.findIndex((e) => e.isPlayer) + 1;

  // Update Friends
  const friendsList = getStoredFriendsLeaderboard().filter((e) => !e.isPlayer);
  const updatedFriends = [...friendsList, playerEntry].sort((a, b) => b.score - a.score);
  localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updatedFriends));
  const friendsRank = updatedFriends.findIndex((e) => e.isPlayer) + 1;

  return { globalRank, friendsRank };
}
