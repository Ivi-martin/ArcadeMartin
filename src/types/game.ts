export type GameScene = 'cover' | 'play' | 'cont' | 'over' | 'win' | 'paused';

export type SkinId = 'classic' | 'dark' | 'gold' | 'cyber' | 'ocean';

export interface Skin {
  id: SkinId;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  colors: {
    b: string;
    B: string;
    r?: string;
    R?: string;
  };
  glowColor: string;
  badge: string;
}

export interface PlayerUpgrades {
  cadence: number;     // 0 to 4 (cooldown 14, 12, 10, 8, 6)
  multiStar: number;   // 0 to 2 (0: single, 1: double shuriken, 2: triple star)
  maxHp: number;       // 0 to 4 (hp: 5, 6, 7, 8, 10)
  speed: number;       // 0 to 3 (speed boost)
  jump: number;        // 0 to 3 (jump boost)
  magnet: number;      // 0 to 3 (coin magnet radius)
  piercing: number;    // 0 or 1 (pierce shielded enemies)
}

export interface DailyRewardState {
  streak: number;          // 1 to 7
  lastClaimDate: string;   // YYYY-MM-DD
  claimedToday: boolean;
  nextClaimTime?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'combat' | 'progression' | 'boss' | 'mastery';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rewardCoins: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  world: number;
  avatar: string;
  isPlayer?: boolean;
  country: string;
  date: string;
  badge?: string;
}

export interface PlayerProfile {
  name: string;
  avatar: string;
  coins: number;
  stars: number;
  highScore: number;
  highestLevel: number;
  activeSkin: SkinId;
  upgrades: PlayerUpgrades;
  dailyReward: DailyRewardState;
  unlockedAchievements: string[];
  totalKills: number;
  totalStomps: number;
  highestCombo: number;
  bossesDefeated: number;
  gamesPlayed: number;
  crtEnabled: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  alpha: number;
  vy: number;
  life: number;
}

export interface GameCoin {
  x: number;
  y: number;
  vy: number;
  vx: number;
  val: number;
  life: number;
  type: 'coin' | 'star' | 'heart';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}
