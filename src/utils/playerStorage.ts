import { PlayerProfile, PlayerUpgrades, DailyRewardState } from '../types/game';

const STORAGE_KEY = 'arcade_martin_player_profile_v1';

export const DEFAULT_UPGRADES: PlayerUpgrades = {
  cadence: 0,
  multiStar: 0,
  maxHp: 0,
  speed: 0,
  jump: 0,
  magnet: 0,
  piercing: 0,
};

export const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Martín',
  avatar: '🥷',
  coins: 150, // Welcome gift coins!
  stars: 0,
  highScore: 0,
  highestLevel: 1,
  activeSkin: 'classic',
  upgrades: DEFAULT_UPGRADES,
  dailyReward: {
    streak: 1,
    lastClaimDate: '',
    claimedToday: false,
  },
  unlockedAchievements: [],
  totalKills: 0,
  totalStomps: 0,
  highestCombo: 0,
  bossesDefeated: 0,
  gamesPlayed: 0,
  crtEnabled: true,
  soundEnabled: true,
  musicEnabled: true,
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: PlayerProfile = JSON.parse(raw);
      // Validate daily reward status based on current date
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      if (parsed.dailyReward) {
        if (parsed.dailyReward.lastClaimDate === today) {
          parsed.dailyReward.claimedToday = true;
        } else if (parsed.dailyReward.lastClaimDate === yesterday) {
          parsed.dailyReward.claimedToday = false;
        } else if (!parsed.dailyReward.lastClaimDate) {
          parsed.dailyReward.claimedToday = false;
          parsed.dailyReward.streak = 1;
        } else {
          // Missed more than 1 day: reset streak to 1
          parsed.dailyReward.claimedToday = false;
          parsed.dailyReward.streak = 1;
        }
      }

      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        upgrades: { ...DEFAULT_UPGRADES, ...parsed.upgrades },
      };
    }
  } catch {
    // fallback
  }
  return { ...DEFAULT_PROFILE };
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // silent fallback
  }
}
