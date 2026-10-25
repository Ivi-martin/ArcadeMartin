import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PlayerProfile, FloatingText, GameCoin, Particle } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { SKINS_CONFIG } from '../data/upgradesData';
import { Pause, Play, Volume2, VolumeX, Tv, Maximize2 } from 'lucide-react';

interface GameCanvasProps {
  profile: PlayerProfile;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onGameOver: (stats: { score: number; level: number; kills: number; coinsEarned: number }) => void;
  onVictory: (stats: { score: number; level: number; kills: number; coinsEarned: number }) => void;
  onUnlockAchievement: (id: string) => void;
  onRequestDevMenu: () => void;
  initialLevel?: number;
}

// Logic Dimensions matching classic pixel ratio
const W = 160;
const H = 145;
const G = 125;
const S = 8; // Canvas scaling factor (1280 x 1160)

// Base Palette
const BASE_PALETTE: Record<string, string> = {
  k: '#111116',
  r: '#ef4444',
  R: '#991b1b',
  s: '#f8c890',
  b: '#2a3a9a',
  B: '#3a5ad0',
  w: '#ffffff',
  p: '#9030d8',
  P: '#b060f8',
  d: '#6a20a8',
  y: '#fd0',
  Y: '#e8a800',
  g: '#94a3b8',
  n: '#8a5a2b',
  N: '#5a3a1a',
  t: '#d8a868',
  u: '#3a9ae8',
  U: '#1a5aa8',
  o: '#f97316',
  h: '#aab',
  H: '#667',
  a: '#6a8aa8',
  A: '#4a6a88',
  q: '#e0ecf4',
  c: '#7fe0e0',
};

// Sprites
const MA = [
  "......kkkkkkkk......",
  ".....kBBBBBBBBk.....",
  "....kBbbbbbbbbbk....",
  "....kbbbbbbbbbbk.rr.",
  "...kRrrrrrrrrrrRkrrR",
  "...kRrrrrrrrrrrRk.R.",
  "...kbsssssssssbk..rr",
  "...kbwkssssskwbk....",
  "...kbwkssssskwbk....",
  "...kbbbbbbbbbbbbk...",
  "....kbBbbbbbbbbk....",
  "..kkbbbbbbbbbbbbkk..",
  ".kBBbbbbbbbbbbbbBBk.",
  "ksskbbbbbbbbbbbbkssk",
  "ksskbbbbbbbbbbbbkssk",
  "kkk.kbbbrrrrbbbk.kkk",
  "....kbbbrrrrbbbk....",
  "....kbbbbbbbbbbk....",
  "....kbbbbbbbbbbk....",
  "....kbbbbkkbbbbk....",
  "....kbbbk..kbbbk....",
  "....kbbbk..kbbbk....",
  "....kkkkk..kkkkk....",
  "....kkkkk..kkkkk....",
];

const EN = [
  "......PPPPPPPd......",
  "......pppppppd......",
  "....PPpppppppppdd...",
  "....ppppppppppppd...",
  "PPPPpppppppppppppdd.",
  "pppppdddppppdddppppd",
  "ppppdwYdppppdwYdpppd",
  "ppppdYYdppppdYYdpppd",
  "ppppdYYdppppdYYdpppd",
  "pppppdddppppdddppppd",
  "pppppppppppppppppppd",
  "dddpppppppppppppdddd",
  "....pppppppppppdd...",
  "....ppppdddddpppd...",
  "....ppppd...dpppd...",
  "PPPPpppd....dpppPPPd",
  "pppppppd....dppppppd",
];

const BAT = [
  "PPPP..PP....PP..PPPP",
  "PppP..Pp....pP..PppP",
  "Pppppppppppppppppppd",
  "pppppppppppppppppppd",
  "..ppppyyppppppyypppp",
  "..ppppyyppppppyypppp",
  "...ppppppppppppppp..",
  ".....pppppppppp.....",
  ".....pppppppppp.....",
];

const STAR = [
  "....w....",
  "...gwg...",
  "ggggwgggg",
  ".gwwwwwg.",
  "..gwwwg..",
  ".gwg.gwg.",
  ".g.....g.",
];

const M_MIRROR = (a: string[]) => a.map((r) => r + [...r].reverse().join(''));

const BEAR = M_MIRROR([
  "...NNN....",
  "..NnnnN...",
  "..NnnnnnnN",
  ".Nnnnnnnnn",
  ".Nnnwknnnn",
  ".Nnnnnnttt",
  ".Nnnnnttkk",
  ".Nnnnnnttt",
  "NNnnnnnnnn",
  "Nnnnnnnnnn",
  "Nnnnnnnnnn",
  ".Nnnnnnnnn",
  ".Nnnnnnnnn",
  ".NNnnnN...",
  ".NnnnnN...",
  ".NNNNNN...",
]);

const BIRD = M_MIRROR([
  "UU........",
  "uuUU......",
  "uuuuUU....",
  ".UuuuuuUuu",
  "..UUuuuuuu",
  "....uuwkuu",
  "....uuuuoo",
  ".....uuuuo",
]);

const SHARK = [
  ".......AA...........",
  "......AaaA.........",
  "AA....AaaaaA........",
  "AAA..AaaaaaaaaaaAA..",
  ".AAAaaaaaaaaaaaaaaaA",
  "..AAaaaaaaaaaawkaaaA",
  "...AAaaaaaaaaaaaaaaA",
  "...AAqqqqqqkwkwkwqA.",
  "..AAAqqqqqqqqqqqqAA.",
  ".AA..AAqqqqqqqqAA...",
  "AA....AAAqqqqAA.....",
  "A.......AAAAA.......",
].map((r) => r.replace(/\s+/g, '').padEnd(20, '.'));

const SUB = [
  "..........kkkk......",
  "..........k.........",
  "........kkkkkk......",
  "........kYyyYk......",
  "g..kkkkkkkkkkkkkkk..",
  "g.kyyyyyyyyyyyyyyyyk",
  "gkyyccyyccyyccyyyyyk",
  "gkyyccyyccyyccyyyyyk",
  "g.kYYYYYYYYYYYYYYYYk",
  "g..kkkkkkkkkkkkkkk..",
];

const BG = [
  '#090a18',
  '#160824',
  '#062220',
  '#250815',
  '#222209',
  '#071430',
  '#2e1508',
  '#141416',
  '#240830',
  '#2f0707',
];

export const GameCanvas: React.FC<GameCanvasProps> = ({
  profile,
  onUpdateProfile,
  onGameOver,
  onVictory,
  onUnlockAchievement,
  onRequestDevMenu,
  initialLevel = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // High-level UI states mirrored from game
  const [hudHp, setHudHp] = useState<number>(5);
  const [hudMaxHp, setHudMaxHp] = useState<number>(5);
  const [hudLevel, setHudLevel] = useState<number>(initialLevel);
  const [hudScore, setHudScore] = useState<number>(0);
  const [hudCoins, setHudCoins] = useState<number>(0);
  const [hudCombo, setHudCombo] = useState<number>(0);
  const [hudKills, setHudKills] = useState<number>(0);
  const [hudNeed, setHudNeed] = useState<number>(4);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(profile.soundEnabled);
  const [crtOn, setCrtOn] = useState<boolean>(profile.crtEnabled);

  // References for pure 60fps game loop without React re-renders
  const gameRef = useRef<{
    keys: Record<string, number>;
    scene: 'cover' | 'play' | 'cont' | 'over' | 'win' | 'paused';
    lvl: number;
    score: number;
    coinsThisRun: number;
    t: number;
    dt: number;
    cont: number;
    kills: number;
    need: number;
    inv: number;
    sh: number;
    msg: number;
    sp: number;
    L: number;
    wd: number;
    P1: {
      x: number;
      y: number;
      vy: number;
      dx: number;
      hp: number;
      maxHp: number;
      cd: number;
      speed: number;
    };
    en: Array<{
      x: number;
      y: number;
      dx: number;
      fly: boolean;
      t: number;
      shielded: boolean;
      shieldHit: number;
      sHp?: number;
      dead?: number;
      st?: number;
    }>;
    st: Array<{
      x: number;
      y: number;
      dx: number;
      dy?: number;
      piercing?: boolean;
    }>;
    fb: Array<{ x: number; y: number; dx: number }>;
    eb: Array<{ x: number; y: number; vy: number }>;
    rocks: Array<{ x: number; dx: number; dead?: number }>;
    weeds: Array<{
      gr: number;
      x: number;
      y: number;
      h: number;
      dir: number;
      age: number;
      life: number;
      dx: number;
    }>;
    bub: Array<{ x: number; y: number; t: number; s: number; l: number }>;
    coins: GameCoin[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    combo: number;
    comboTimer: number;
    hitStop: number;
    boss: {
      x: number;
      y: number;
      hp: number;
      maxHp: number;
      dir: number;
      ft: number;
      fl: number;
      ph: number;
      alen: number;
      ay: number;
    } | null;
    bt: number;
    rt: number;
    runKills: number;
    runStomps: number;
    runAerialKills: number;
    runShieldBreaks: number;
  }>({
    keys: {},
    scene: 'cover',
    lvl: initialLevel,
    score: 0,
    coinsThisRun: 0,
    t: 0,
    dt: 0,
    cont: 5,
    kills: 0,
    need: 6,
    inv: 0,
    sh: 0,
    msg: 100,
    sp: 0,
    L: 1,
    wd: 1,
    P1: {
      x: 70,
      y: G - 12,
      vy: 0,
      dx: 1,
      hp: 5,
      maxHp: 5,
      cd: 0,
      speed: 1.6,
    },
    en: [],
    st: [],
    fb: [],
    eb: [],
    rocks: [],
    weeds: [],
    bub: [],
    coins: [],
    particles: [],
    floatingTexts: [],
    combo: 0,
    comboTimer: 0,
    hitStop: 0,
    boss: null,
    bt: 0,
    rt: 0,
    runKills: 0,
    runStomps: 0,
    runAerialKills: 0,
    runShieldBreaks: 0,
  });

  // Calculate current character skin palette
  const activeSkinObj = SKINS_CONFIG.find((s) => s.id === profile.activeSkin) || SKINS_CONFIG[0];
  const activePalette: Record<string, string> = {
    ...BASE_PALETTE,
    b: activeSkinObj.colors.b,
    B: activeSkinObj.colors.B,
    r: activeSkinObj.colors.r || BASE_PALETTE.r,
    R: activeSkinObj.colors.R || BASE_PALETTE.R,
  };

  // Helper to spawn floating text
  const addFloatingText = (x: number, y: number, text: string, color: string = '#ffd700', size: number = 7) => {
    gameRef.current.floatingTexts.push({
      id: Math.random(),
      x,
      y,
      text,
      color,
      size,
      alpha: 1,
      vy: -0.6,
      life: 45,
    });
  };

  // Helper to spawn particle burst
  const spawnParticles = (x: number, y: number, count: number, colors: string[]) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.2;
      gameRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() < 0.4 ? 2 : 1,
        alpha: 1,
        life: 20 + Math.random() * 20,
        maxLife: 40,
      });
    }
  };

  // Spawn bouncing gold coins on kill
  const spawnCoins = (x: number, y: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const isStar = Math.random() < 0.15;
      gameRef.current.coins.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -2.5 - Math.random() * 1.5,
        val: isStar ? 25 : 10,
        life: 300,
        type: isStar ? 'star' : 'coin',
      });
    }
  };

  // Start Level with Upgrades
  const startLvl = useCallback(() => {
    const g = gameRef.current;
    g.L = ((g.lvl - 1) % 10) + 1;
    g.wd = g.lvl > 20 ? 3 : g.lvl > 10 ? 2 : 1;
    g.scene = 'play';
    g.en = [];
    g.st = [];
    g.fb = [];
    g.eb = [];
    g.rocks = [];
    g.weeds = [];
    g.bub = [];
    g.coins = [];
    g.particles = [];
    g.floatingTexts = [];
    g.bt = 0;
    g.rt = 120;
    g.kills = 0;
    g.need = g.L < 10 ? 4 + g.L * 2 : 0;
    g.sp = 0;
    g.inv = 0;
    g.msg = 100;
    g.P1.x = 70;
    g.P1.y = G - 12;
    g.P1.vy = 0;

    // Upgrades calculation
    const hpBonus = profile.upgrades.maxHp >= 4 ? 5 : profile.upgrades.maxHp;
    g.P1.maxHp = 5 + hpBonus;
    g.P1.hp = Math.min(g.P1.hp, g.P1.maxHp);
    g.P1.speed = 1.6 + profile.upgrades.speed * 0.22;

    // Boss setup
    g.boss =
      g.L === 10
        ? {
            x: 118,
            y: G - 36,
            hp: 30,
            maxHp: 30,
            dir: -1,
            ft: 90,
            fl: 0,
            ph: 0,
            alen: 0,
            ay: G - 6,
          }
        : null;

    setHudLevel(g.lvl);
    setHudHp(g.P1.hp);
    setHudMaxHp(g.P1.maxHp);
    setHudKills(0);
    setHudNeed(g.need);

    soundEngine.startMusic(g.wd, g.L === 10);
  }, [profile.upgrades.maxHp, profile.upgrades.speed]);

  // Handle Player Hurt
  const hurt = () => {
    const g = gameRef.current;
    if (g.inv > 0) return;
    g.P1.hp--;
    g.inv = 90;
    g.sh = 10;
    g.hitStop = 4;
    g.combo = 0;
    setHudCombo(0);
    setHudHp(g.P1.hp);
    soundEngine.playSound('hurt');
    addFloatingText(g.P1.x + 4, g.P1.y - 4, '-1 ♥', '#ef4444', 8);
    spawnParticles(g.P1.x + 4, g.P1.y + 4, 8, ['#ef4444', '#ffffff']);

    if (g.P1.hp <= 0) {
      soundEngine.stopMusic();
      if (g.cont > 0) {
        g.scene = 'cont';
        g.dt = g.t;
        soundEngine.playSound('gameOver');
      } else {
        g.scene = 'over';
        g.dt = g.t;
        soundEngine.playSound('gameOver');
        onGameOver({
          score: g.score,
          level: g.lvl,
          kills: g.runKills,
          coinsEarned: g.coinsThisRun,
        });
      }
    }
  };

  // Keyboard tap / start
  const handleTap = useCallback(() => {
    const g = gameRef.current;
    if (g.scene === 'cont') {
      if (g.t - g.dt > 40) {
        g.cont--;
        g.P1.hp = g.P1.maxHp;
        startLvl();
      }
      return;
    }
    if (g.scene === 'cover' || g.scene === 'over' || g.scene === 'win') {
      g.lvl = initialLevel || 1;
      g.score = 0;
      g.coinsThisRun = 0;
      g.cont = 5;
      g.runKills = 0;
      g.runStomps = 0;
      g.runAerialKills = 0;
      g.runShieldBreaks = 0;
      const hpBonus = profile.upgrades.maxHp >= 4 ? 5 : profile.upgrades.maxHp;
      g.P1 = {
        x: 70,
        y: G - 12,
        vy: 0,
        dx: 1,
        hp: 5 + hpBonus,
        maxHp: 5 + hpBonus,
        cd: 0,
        speed: 1.6 + profile.upgrades.speed * 0.22,
      };
      setHudScore(0);
      setHudCoins(0);
      setHudHp(g.P1.hp);
      setHudMaxHp(g.P1.maxHp);
      startLvl();
    }
  }, [initialLevel, profile.upgrades.maxHp, profile.upgrades.speed, startLvl]);

  // Main Simulation Update Step
  const updateGame = () => {
    const g = gameRef.current;
    if (g.scene !== 'play') {
      g.t++;
      return;
    }

    if (g.hitStop > 0) {
      g.hitStop--;
      return;
    }

    g.t++;
    if (g.sh > 0) g.sh--;
    if (g.msg > 0) g.msg--;

    // Combo Timer Decay
    if (g.comboTimer > 0) {
      g.comboTimer--;
      if (g.comboTimer <= 0) {
        g.combo = 0;
        setHudCombo(0);
      }
    }

    const shoots = g.wd === 1 ? g.L >= 6 && g.L <= 7 : g.L >= 6;
    const gr = g.wd === 3 ? 0.2 : 0.28;
    const jumpBoost = profile.upgrades.jump * 0.25;
    const jv = (g.wd === 3 ? -4.2 : -5) - jumpBoost;

    // Movement
    if (g.keys.l) {
      g.P1.x -= g.P1.speed;
      g.P1.dx = -1;
    }
    if (g.keys.r) {
      g.P1.x += g.P1.speed;
      g.P1.dx = 1;
    }
    g.P1.x = Math.max(0, Math.min(W - 10, g.P1.x));

    // World 2 Rocks
    if (g.wd === 2 && g.L >= 5) {
      g.rt--;
      if (g.rt <= 0) {
        g.rt = Math.max(70, 160 - g.L * 6) + Math.random() * 50;
        const lf = Math.random() < 0.5;
        g.rocks.push({ x: lf ? -9 : W, dx: (lf ? 1 : -1) * (0.5 + g.L * 0.03) });
      }
    }

    // World 3 Seaweeds
    if (g.wd === 3 && g.L >= 5) {
      g.rt--;
      if (g.rt <= 0) {
        g.rt = Math.max(80, 170 - g.L * 7) + Math.random() * 60;
        if (g.weeds.length < 3) {
          const gd = Math.random() < 0.5;
          const dir = Math.random() < 0.5 ? -1 : 1;
          const h = gd ? 22 + Math.random() * 10 : 12 + Math.random() * 6;
          g.weeds.push(
            gd
              ? { gr: 1, x: 10 + Math.random() * (W - 28), y: G, h, dir, age: 0, life: 340, dx: 0 }
              : {
                  gr: 0,
                  x: dir > 0 ? -10 : W + 2,
                  y: G - 60 + Math.random() * 40,
                  h,
                  dir,
                  age: 0,
                  life: 9e9,
                  dx: dir * (0.35 + g.L * 0.02),
                }
          );
        }
      }
    }

    // Rock Collisions
    g.rocks.forEach((r) => {
      r.x += r.dx;
      if (!r.dead && g.P1.x + 8 > r.x && g.P1.x + 2 < r.x + 9 && g.P1.y + 12 > G - 4) {
        const nx = r.dx < 0 ? r.x - 8 : r.x + 7;
        if (nx < 0 || nx > W - 10) {
          g.P1.x = Math.max(0, Math.min(W - 10, nx));
          r.dead = 1;
          hurt();
        } else {
          g.P1.x = nx;
        }
      }
    });
    g.rocks = g.rocks.filter((r) => !r.dead && r.x > -20 && r.x < W + 20);

    // Gravity & Ground
    const pf = g.P1.y + 12;
    g.P1.vy += gr;
    g.P1.y += g.P1.vy;
    const fv = g.P1.vy;
    if (g.P1.y >= G - 12) {
      g.P1.y = G - 12;
      g.P1.vy = 0;
      if (g.keys.j) {
        g.P1.vy = jv;
        soundEngine.playSound('jump');
        spawnParticles(g.P1.x + 5, G - 2, 4, ['#94a3b8', '#cbd5e1']);
      }
    }

    // World 3 Bubbles
    if (g.wd === 3) {
      g.bt = (g.bt + 1) % 32;
      if (g.bt === 0) {
        g.bub.push({
          x: g.P1.x + (g.P1.dx < 0 ? 9 : 1),
          y: g.P1.y - 4,
          t: Math.random() * 6,
          s: Math.random() < 0.4 ? 1 : 0,
          l: 100,
        });
      }
      g.bub.forEach((b) => {
        b.y -= 0.4;
        b.t += 0.12;
        b.x += Math.sin(b.t) * 0.15;
        b.l--;
      });
      g.bub = g.bub.filter((b) => b.l > 0 && b.y > -4);
    }

    // Weed Drag
    g.weeds.forEach((w) => {
      w.age++;
      w.x += w.dx;
      const eh = w.gr ? w.h * Math.min(1, w.age / 30, (w.life - w.age) / 30) : w.h;
      if (
        eh > 4 &&
        g.P1.x + 8 > w.x &&
        g.P1.x + 2 < w.x + 8 &&
        g.P1.y + 12 > (w.gr ? G - eh : w.y) &&
        g.P1.y < (w.gr ? G : w.y + w.h)
      ) {
        g.P1.x += w.dir * 0.9;
      }
    });
    g.P1.x = Math.max(0, Math.min(W - 10, g.P1.x));
    g.weeds = g.weeds.filter((w) => w.age < w.life && w.x > -14 && w.x < W + 14);

    // Shooting with MultiStar & Cadence Upgrades
    const cdCooldown = Math.max(6, 14 - profile.upgrades.cadence * 2);
    if (g.P1.cd > 0) g.P1.cd--;
    if (g.keys.f && g.P1.cd === 0) {
      soundEngine.playSound('star');
      const piercing = profile.upgrades.piercing > 0;
      if (profile.upgrades.multiStar === 0) {
        g.st.push({ x: g.P1.x + 4, y: g.P1.y + 5, dx: g.P1.dx * 3.6, piercing });
      } else if (profile.upgrades.multiStar === 1) {
        g.st.push({ x: g.P1.x + 4, y: g.P1.y + 3, dx: g.P1.dx * 3.6, piercing });
        g.st.push({ x: g.P1.x + 4, y: g.P1.y + 7, dx: g.P1.dx * 3.6, piercing });
      } else {
        // Triple star spread!
        g.st.push({ x: g.P1.x + 4, y: g.P1.y + 5, dx: g.P1.dx * 3.6, dy: 0, piercing });
        g.st.push({ x: g.P1.x + 4, y: g.P1.y + 3, dx: g.P1.dx * 3.4, dy: -0.7, piercing });
        g.st.push({ x: g.P1.x + 4, y: g.P1.y + 7, dx: g.P1.dx * 3.4, dy: 0.7, piercing });
      }
      g.P1.cd = cdCooldown;
    }

    if (g.inv > 0) g.inv--;

    // Star movement
    g.st.forEach((s) => {
      s.x += s.dx;
      if (s.dy) s.y += s.dy;
    });
    g.st = g.st.filter((s) => s.x > -6 && s.x < W + 6 && s.y > -10 && s.y < H + 10);

    // Enemy Spawning
    g.sp--;
    const rate = Math.max(35, 110 - g.L * 7);
    if (g.sp <= 0 && (g.L < 10 || g.en.length < 2) && (g.L === 10 || g.kills + g.en.length < g.need)) {
      g.sp = g.L === 10 ? 220 : rate;
      const fly = g.L >= 4 && Math.random() < 0.4;
      const l = Math.random() < 0.5;
      const shielded = g.L >= 8 && !fly && (g.L === 10 || Math.random() < 0.5);
      const e = {
        x: l ? -8 : W,
        y: fly ? G - 45 - Math.random() * 20 : G - 8,
        dx: (l ? 1 : -1) * (0.4 + g.L * 0.07) * (g.L === 8 || g.L === 9 ? 0.8 : 1),
        fly,
        t: Math.random() * 6,
        shielded,
        shieldHit: 0,
        sHp: shielded ? 2 : 0,
        st: shoots && fly ? 40 + Math.random() * 40 : undefined,
      };
      g.en.push(e);
    }

    // Enemy updates
    g.en.forEach((e) => {
      e.x += e.dx;
      e.t += 0.1;
      if (e.fly) e.y += Math.sin(e.t) * 0.6;
      if (shoots && e.fly && e.st !== undefined) {
        e.st--;
        if (e.st <= 0) {
          e.st = 70 + Math.random() * 60;
          g.eb.push({ x: e.x + 3, y: e.y + 8, vy: g.wd === 3 ? 1.5 : 1.8 });
        }
      }
    });

    // Handle Combo & Score multipliers
    const registerKill = (e: typeof g.en[0], byStomp: boolean = false) => {
      e.dead = 1;
      g.kills++;
      g.runKills++;
      setHudKills(g.kills);
      if (byStomp) g.runStomps++;
      if (e.fly) g.runAerialKills++;

      g.combo++;
      g.comboTimer = 140; // ~2.3 seconds to chain
      setHudCombo(g.combo);
      soundEngine.playSound('combo', g.combo);

      const multiplier = Math.min(5, 1 + Math.floor(g.combo / 2));
      const basePoints = byStomp ? 20 : 10;
      const totalEarned = basePoints * multiplier;
      g.score += totalEarned;
      setHudScore(g.score);

      addFloatingText(
        e.x + 3,
        e.y - 4,
        g.combo > 1 ? `+${totalEarned} (x${multiplier})` : `+${totalEarned}`,
        g.combo >= 4 ? '#f43f5e' : '#ffd700',
        g.combo >= 3 ? 8 : 7
      );

      spawnParticles(e.x + 4, e.y + 4, 10, ['#b060f8', '#ffd700', '#ffffff']);
      spawnCoins(e.x + 4, e.y + 2, Math.random() < 0.6 ? 2 : 1);

      // Achievements triggers
      onUnlockAchievement('first_kill');
      if (g.combo >= 5) onUnlockAchievement('combo_frenzy');
      if (g.runStomps >= 15) onUnlockAchievement('stomp_master');
      if (g.runAerialKills >= 20) onUnlockAchievement('aerial_ace');
      if (g.score >= 3500) onUnlockAchievement('score_champ');
    };

    // Star hits Enemy
    g.st.forEach((s) => {
      g.en.forEach((e) => {
        if (!e.dead && s.x > e.x - 3 && s.x < e.x + 9 && s.y > e.y - 3 && s.y < e.y + 9) {
          if (e.shielded && !s.piercing) {
            const hitFront = (e.dx > 0 && s.x > e.x + 4) || (e.dx < 0 && s.x < e.x + 4);
            if (hitFront) {
              e.shieldHit = 8;
              e.sHp = (e.sHp ?? 2) - 1;
              soundEngine.playSound('shield');
              spawnParticles(s.x, s.y, 5, ['#00f0ff', '#ffffff']);
              if (e.sHp <= 0) {
                e.shielded = false;
                g.runShieldBreaks++;
                if (g.runShieldBreaks >= 10) onUnlockAchievement('shield_breaker');
                addFloatingText(e.x, e.y - 2, 'ESCUDO ROTO', '#38bdf8', 6);
              }
              s.x = -99;
            } else {
              soundEngine.playSound('hit');
              registerKill(e, false);
              s.x = -99;
            }
          } else {
            soundEngine.playSound('hit');
            registerKill(e, false);
            if (!s.piercing) s.x = -99;
          }
        }
      });

      // Star hits Boss
      if (g.boss && s.x > g.boss.x && s.x < g.boss.x + 28 && s.y > g.boss.y && s.y < g.boss.y + 36) {
        g.boss.hp--;
        g.boss.fl = 4;
        s.x = -99;
        g.score += 5;
        setHudScore(g.score);
        soundEngine.playSound('hit');
        addFloatingText(g.boss.x + 14, g.boss.y - 4, '-1', '#ef4444', 7);
        spawnParticles(s.x, s.y, 6, ['#ef4444', '#ffd700']);
      }
    });

    g.en = g.en.filter((e) => !e.dead && e.x > -20 && e.x < W + 20);

    // Player vs Enemy Collisions (Stomp or Hurt)
    g.en.forEach((e) => {
      if (!e.dead && g.P1.x + 8 > e.x && g.P1.x + 2 < e.x + 8 && g.P1.y + 12 > e.y && g.P1.y < e.y + 8) {
        if (fv > 0 && pf <= e.y + 4) {
          // Stomp!
          soundEngine.playSound('stomp');
          g.hitStop = 2;
          if (e.shielded) {
            e.shielded = false;
            e.sHp = 0;
            e.shieldHit = 8;
            g.score += 15;
            setHudScore(g.score);
            addFloatingText(e.x, e.y - 4, 'ROTURA!', '#38bdf8', 7);
          } else {
            registerKill(e, true);
          }
          g.P1.y = e.y - 12.5;
          g.P1.vy = g.keys.j ? jv * 0.95 : jv * 0.65;
        } else {
          hurt();
        }
      }
      if (e.shieldHit > 0) e.shieldHit--;
    });

    // Enemy bullets vs Player
    g.eb.forEach((b) => {
      b.y += b.vy;
      if (g.P1.x + 8 > b.x && g.P1.x + 2 < b.x + 3 && g.P1.y + 12 > b.y && g.P1.y < b.y + 5) {
        hurt();
      }
    });
    g.eb = g.eb.filter((b) => b.y < H + 10);

    // Coins and Stars Physics & Magnet Attraction
    const magnetRadius =
      profile.upgrades.magnet === 1 ? 40 : profile.upgrades.magnet === 2 ? 75 : profile.upgrades.magnet === 3 ? 120 : 0;

    g.coins.forEach((c) => {
      c.vy += 0.22;
      c.x += c.vx;
      c.y += c.vy;
      c.life--;

      if (c.y >= G - 4) {
        c.y = G - 4;
        c.vy = -c.vy * 0.4;
        c.vx *= 0.8;
      }

      // Magnet attraction
      if (magnetRadius > 0) {
        const dx = g.P1.x + 4 - c.x;
        const dy = g.P1.y + 6 - c.y;
        const dist = Math.hypot(dx, dy);
        if (dist < magnetRadius && dist > 1) {
          c.vx += (dx / dist) * 0.8;
          c.vy += (dy / dist) * 0.8;
        }
      }

      // Pickup
      if (Math.abs(g.P1.x + 4 - c.x) < 8 && Math.abs(g.P1.y + 6 - c.y) < 10) {
        c.life = 0;
        soundEngine.playSound('coin');
        g.coinsThisRun += c.val;
        setHudCoins(g.coinsThisRun);
        addFloatingText(c.x, c.y - 4, `+${c.val} 🪙`, '#ffd700', 6);
        spawnParticles(c.x, c.y, 4, ['#ffd700', '#ffffff']);

        // Update profile coins
        onUpdateProfile((prev) => ({
          ...prev,
          coins: prev.coins + c.val,
          stars: c.type === 'star' ? prev.stars + 1 : prev.stars,
        }));

        if (profile.coins + g.coinsThisRun >= 1500) {
          onUnlockAchievement('coin_hoarder');
        }
      }
    });
    g.coins = g.coins.filter((c) => c.life > 0);

    // Particles decay
    g.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);
    });
    g.particles = g.particles.filter((p) => p.life > 0);

    // Floating text decay
    g.floatingTexts.forEach((f) => {
      f.y += f.vy;
      f.life--;
      f.alpha = Math.max(0, f.life / 45);
    });
    g.floatingTexts = g.floatingTexts.filter((f) => f.life > 0);

    // Boss Phase Logic
    if (g.boss) {
      const b = g.boss;
      b.x += b.dir * 0.3;
      if (b.x < 95) b.dir = 1;
      if (b.x > 125) b.dir = -1;
      if (b.fl > 0) b.fl--;

      if (g.wd === 1) {
        b.ft--;
        if (b.ft <= 0) {
          b.ft = 70;
          g.fb.push({ x: b.x, y: Math.random() < 0.5 ? G - 6 : G - 30, dx: -1.6 });
        }
      } else {
        const bx = b.x + (g.wd === 3 ? 1 : 4);
        const rg = g.wd === 3 && b.hp <= 15 ? 3.5 : 2.5;
        if (b.ph === 0) {
          b.ft--;
          if (b.ft === 30) {
            b.ay = Math.random() < 0.5 ? G - 6 : G - 30;
            soundEngine.playSound('bossLaser');
          }
          if (b.ft <= 0) {
            b.ph = 1;
            b.alen = 0;
          }
        } else if (b.ph === 1) {
          b.alen += rg;
          if (b.alen >= bx) {
            b.alen = bx;
            b.ph = 2;
          }
        } else {
          b.alen -= rg;
          if (b.alen <= 0) {
            b.alen = 0;
            b.ph = 0;
            b.ft = rg > 3 ? 45 : 70;
          }
        }

        if (b.alen > 0 && g.P1.x + 8 > bx - b.alen && g.P1.x + 2 < bx && g.P1.y + 12 > b.ay && g.P1.y < b.ay + 6) {
          hurt();
        }
      }

      // Boss Defeated
      if (b.hp <= 0) {
        g.score += 500;
        setHudScore(g.score);
        spawnParticles(b.x + 14, b.y + 14, 30, ['#ffd700', '#ef4444', '#b060f8', '#ffffff']);
        spawnCoins(b.x + 10, b.y + 10, 8);
        soundEngine.playSound('levelUp');

        if (g.wd === 1) onUnlockAchievement('world1_cleared');
        if (g.wd === 2) onUnlockAchievement('world2_cleared');

        if (g.lvl < 30) {
          g.lvl++;
          g.P1.hp = g.P1.maxHp;
          setHudHp(g.P1.hp);
          startLvl();
          g.msg = 160;
        } else {
          // Final Victory!
          g.scene = 'win';
          soundEngine.stopMusic();
          soundEngine.playSound('victory');
          onUnlockAchievement('game_completed');
          onVictory({
            score: g.score,
            level: g.lvl,
            kills: g.runKills,
            coinsEarned: g.coinsThisRun,
          });
        }
      }
    }

    // Fireballs vs Player
    g.fb.forEach((f) => {
      f.x += f.dx;
      if (g.P1.x + 8 > f.x && g.P1.x + 2 < f.x + 8 && g.P1.y + 12 > f.y && g.P1.y < f.y + 6) {
        hurt();
      }
    });
    g.fb = g.fb.filter((f) => f.x > -10);

    // Normal Stage Clear
    if (g.L < 10 && g.kills >= g.need && g.en.length === 0) {
      g.lvl++;
      g.score += 50;
      g.P1.hp = Math.min(g.P1.maxHp, g.P1.hp + 1);
      soundEngine.playSound('levelUp');
      addFloatingText(80, 50, '¡NIVEL COMPLETADO!', '#ffd700', 9);
      setHudScore(g.score);
      setHudHp(g.P1.hp);
      startLvl();
    }
  };

  // Rendering Helpers
  const renderSprite = (
    ctx: CanvasRenderingContext2D,
    arr: string[],
    x: number,
    y: number,
    s = 1,
    f = 0,
    customPalette: Record<string, string> = activePalette
  ) => {
    const q = (v: number) => Math.round(v * 2) / 2;
    for (let j = 0; j < arr.length; j++) {
      for (let i = 0; i < arr[j].length; i++) {
        const c = arr[j][f ? arr[j].length - 1 - i : i];
        if (c !== '.') {
          ctx.fillStyle = customPalette[c] || BASE_PALETTE[c] || '#fff';
          ctx.fillRect(q(x + i * s), q(y + j * s), s + 0.02, s + 0.02);
        }
      }
    }
  };

  const renderText = (
    ctx: CanvasRenderingContext2D,
    s: string,
    x: number,
    y: number,
    sz = 8,
    c = '#fd0',
    align: CanvasTextAlign = 'center'
  ) => {
    ctx.font = `bold ${sz}px monospace`;
    ctx.textAlign = align;
    ctx.fillStyle = '#050508';
    ctx.fillText(s, x + 1, y + 1);
    ctx.fillStyle = c;
    ctx.fillText(s, x, y);
  };

  const renderBackground = (ctx: CanvasRenderingContext2D) => {
    const g = gameRef.current;
    if (g.lvl > 20) {
      // Ocean background
      const d = (g.L - 1) / 9;
      for (let i = 0; i < H; i += 5) {
        ctx.fillStyle = `hsl(${200 + d * 22}, ${78 - d * 12}%, ${52 - d * 26 - (i / H) * 22}%)`;
        ctx.fillRect(0, i, W, 5.5);
      }
      // Light shafts
      ctx.fillStyle = `rgba(255,255,255,${0.09 - d * 0.06})`;
      for (let i = 0; i < 5; i++) {
        const x = i * 38 + ((g.t * 0.12) % 38) - 10;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 12, 0);
        ctx.lineTo(x - 14, G);
        ctx.lineTo(x - 30, G);
        ctx.fill();
      }
      // Coral silhouettes
      ctx.fillStyle = 'rgba(0,25,55,.35)';
      for (let i = 0; i < 8; i++) {
        const x = i * 22 + ((i * 7) % 9);
        const h = 10 + ((i * 13) % 14);
        ctx.fillRect(x, G - h, 8, h);
        ctx.fillRect(x + 2, G - h - 3, 4, 3);
      }
      // Ocean Floor
      ctx.fillStyle = '#d6bf7a';
      ctx.fillRect(0, G, W, 4);
      ctx.fillStyle = '#b89c58';
      ctx.fillRect(0, G + 4, W, H - G);
      return;
    }

    if (g.lvl > 10) {
      // Forest Background
      ctx.fillStyle = '#8ad0ff';
      ctx.fillRect(0, 0, W, H);
      // Sun
      ctx.fillStyle = '#fff6a0';
      ctx.fillRect(130, 10, 12, 12);
      // Clouds
      ctx.fillStyle = '#ffffff';
      [
        [20, 18],
        [70, 28],
        [105, 14],
      ].forEach((c) => {
        ctx.fillRect(c[0], c[1], 16, 4);
        ctx.fillRect(c[0] + 4, c[1] - 3, 9, 3);
      });
      // Pine trees
      for (let i = 0; i < 9; i++) {
        const x = i * 20 - 5;
        const h = (i * 13) % 14;
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(x + 8, G - 34, 4, 34);
        ctx.fillStyle = '#2a7a2a';
        ctx.fillRect(x + 1, G - 62 + h, 18, 28);
        ctx.fillStyle = '#3a9a3a';
        ctx.fillRect(x + 4, G - 68 + h, 12, 10);
      }
      // Forest Floor
      ctx.fillStyle = '#3a8a2a';
      ctx.fillRect(0, G, W, 4);
      ctx.fillStyle = '#6a4a2a';
      ctx.fillRect(0, G + 4, W, H - G);
      return;
    }

    // World 1 Castle Night Background
    ctx.fillStyle = BG[(g.lvl - 1) % 10];
    ctx.fillRect(0, 0, W, H);
    // Twinkling Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 25; i++) {
      ctx.fillRect((i * 37) % W, (i * 23) % 110, 1, 1);
    }
    // Moon
    ctx.fillStyle = '#ffe9a0';
    ctx.fillRect(130, 12, 12, 12);
    ctx.fillStyle = BG[(g.lvl - 1) % 10];
    ctx.fillRect(135, 10, 10, 10);

    // Castle Floor
    ctx.fillStyle = '#2a5a2a';
    ctx.fillRect(0, G, W, 4);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(0, G + 4, W, H - G);
  };

  // Boss Renders
  const drawBossMaligna = (ctx: CanvasRenderingContext2D) => {
    const b = gameRef.current.boss;
    if (!b) return;
    const x = Math.round(b.x);
    const y = b.y;
    const f = b.fl > 0;
    const cHair = f ? '#fff' : '#a0663b';
    const cHairD = f ? '#fff' : '#7a4a28';
    const cSkin = f ? '#fff' : '#ffe0bd';
    const cDress = f ? '#fff' : '#2e0b3e';
    const cCape = f ? '#fff' : '#4b1a7a';
    const cGold = f ? '#fff' : '#fd0';

    ctx.fillStyle = cHairD;
    ctx.fillRect(x + 2, y + 8, 24, 28);
    ctx.fillStyle = cHair;
    ctx.fillRect(x + 3, y + 8, 22, 26);
    ctx.fillStyle = cDress;
    ctx.fillRect(x, y + 24, 28, 12);
    ctx.fillStyle = cCape;
    ctx.fillRect(x - 1, y + 22, 4, 10);
    ctx.fillRect(x + 25, y + 22, 4, 10);
    ctx.fillStyle = cGold;
    ctx.fillRect(x + 13, y + 26, 2, 8);
    ctx.fillStyle = cSkin;
    ctx.fillRect(x + 8, y + 8, 12, 12);
    ctx.fillStyle = '#111';
    ctx.fillRect(x + 8, y + 11, 4, 2);
    ctx.fillRect(x + 16, y + 11, 4, 2);
    ctx.fillStyle = f ? '#fff' : '#111';
    ctx.fillRect(x + 9, y + 2, 10, 3);
    ctx.fillRect(x + 8, y, 2, 4);
    ctx.fillRect(x + 12, y - 2, 2, 5);
    ctx.fillRect(x + 16, y, 2, 4);

    // Health Bar
    ctx.fillStyle = '#3f1118';
    ctx.fillRect(30, H - 9, 100, 5);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(30, H - 9, (b.hp / b.maxHp) * 100, 5);
    renderText(ctx, 'MALIGNA - HECHICERA', 80, H - 11, 6, '#f43f5e');
  };

  const drawBossCornudo = (ctx: CanvasRenderingContext2D) => {
    const b = gameRef.current.boss;
    if (!b) return;
    const x = Math.round(b.x);
    const y = b.y;
    const f = b.fl > 0;
    const c1 = f ? '#fff' : '#8a5a2b';
    const c2 = f ? '#fff' : '#5a3a1a';
    const c3 = f ? '#fff' : '#e8c070';
    ctx.fillStyle = c2;
    [5, 10, 20, 25].forEach((l) => ctx.fillRect(x + l, y + 27, 3, 9));
    ctx.fillStyle = c1;
    ctx.fillRect(x + 4, y + 15, 24, 13);
    ctx.fillRect(x + 1, y + 8, 8, 14);
    ctx.fillRect(x - 1, y + 9, 6, 6);
    ctx.fillStyle = c3;
    ctx.fillRect(x + 4, y, 2, 9);
    ctx.fillRect(x + 1, y + 2, 3, 1);
    ctx.fillRect(x + 6, y + 3, 3, 1);

    const bx = x + 4;
    if (b.ph === 0 && b.ft < 30 && b.ft % 6 < 3) {
      ctx.fillStyle = 'rgba(255,80,80,.6)';
      ctx.fillRect(0, b.ay + 2, bx, 2);
    }
    if (b.alen > 0) {
      ctx.fillStyle = c3;
      ctx.fillRect(bx - b.alen, b.ay + 2, b.alen, 2);
    }

    ctx.fillStyle = '#3f1118';
    ctx.fillRect(30, H - 9, 100, 5);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(30, H - 9, (b.hp / b.maxHp) * 100, 5);
    renderText(ctx, 'CORNUDO - BESTIA ANCESTRAL', 80, H - 11, 6, '#eab308');
  };

  const drawBossOcto = (ctx: CanvasRenderingContext2D) => {
    const b = gameRef.current.boss;
    if (!b) return;
    const x = Math.round(b.x);
    const y = b.y;
    const f = b.fl > 0;
    const c1 = f ? '#fff' : '#d0406a';
    const c2 = f ? '#fff' : '#8a2048';
    const c3 = f ? '#fff' : '#f08aa8';
    const R = (a: number, q: number, w: number, h: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x + a, y + q, w, h);
    };

    const g = gameRef.current;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 4; j++) {
        R(
          1 + i * 4.4 + Math.sin(g.t * 0.1 + i + j * 0.8) * (0.4 + j * 0.35),
          21 + j * 3.7,
          3.6,
          3.9,
          j % 2 ? c1 : c2
        );
      }
    }
    R(6, 0, 16, 2, c1);
    R(3, 2, 22, 3, c1);
    R(1, 5, 26, 12, c1);
    R(5, 9, 7, 6, '#fff');
    R(16, 9, 7, 6, '#fff');
    R(5, 11, 3, 3, '#111');
    R(16, 11, 3, 3, '#111');

    const ox = b.x + 1;
    if (b.ph === 0 && b.ft < 30 && b.ft % 6 < 3) {
      ctx.fillStyle = 'rgba(255,80,80,.6)';
      ctx.fillRect(0, b.ay + 2, ox, 2);
    }
    if (b.alen > 0) {
      const x0 = ox - b.alen;
      for (let i = x0; i < ox; i += 2) {
        const th = 2.6 + (1.8 * (i - x0)) / b.alen;
        const yy = b.ay + 3 + Math.sin(i * 0.3 + g.t * 0.25) * 1.2;
        ctx.fillStyle = c1;
        ctx.fillRect(i, yy - th / 2, 2.2, th);
      }
    }

    ctx.fillStyle = '#3f1118';
    ctx.fillRect(30, H - 9, 100, 5);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(30, H - 9, (b.hp / b.maxHp) * 100, 5);
    renderText(ctx, 'LEVIATÁN PULPO', 80, H - 11, 6, '#ec4899');
  };

  // Main Canvas Render
  const drawScene = (ctx: CanvasRenderingContext2D) => {
    const g = gameRef.current;
    ctx.save();

    // Camera Shake
    if (g.sh > 0) {
      ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2);
    }

    renderBackground(ctx);

    // Render Enemies
    g.en.forEach((e) => {
      const w2 = g.wd === 2;
      if (g.wd === 3) {
        renderSprite(ctx, e.fly ? SUB : SHARK, e.x, e.y + 2, 0.5, e.dx < 0 ? 1 : 0);
      } else if (e.fly) {
        renderSprite(ctx, w2 ? BIRD : BAT, e.x, e.y + 2, 0.5, e.dx < 0 ? 1 : 0);
      } else {
        renderSprite(ctx, w2 ? BEAR : EN, e.x, e.y - (w2 ? 0 : 0.5), 0.5, e.dx < 0 ? 1 : 0);
      }

      // Shields
      if (e.shielded) {
        if (g.wd === 3) {
          ctx.fillStyle = e.shieldHit > 0 ? '#fff' : 'rgba(143,216,255,.6)';
          ctx.fillRect(e.dx > 0 ? e.x + 5.5 : e.x - 0.5, e.y + 1.5, 5, 6);
        } else if (w2) {
          ctx.fillStyle = e.shieldHit > 0 ? '#fff' : '#aab';
          ctx.fillRect(e.x + 1.5, e.y + 1, 7, 2);
        } else {
          ctx.fillStyle = e.shieldHit > 0 ? '#fff' : '#00f0ff';
          ctx.fillRect(e.dx < 0 ? e.x - 1.5 : e.x + 8.5, e.y, 2, 8);
        }
      }
    });

    // Rocks
    g.rocks.forEach((r) => {
      const x = Math.round(r.x);
      ctx.fillStyle = '#555';
      ctx.fillRect(x + 1, G - 7, 7, 7);
      ctx.fillStyle = '#999';
      ctx.fillRect(x + 2, G - 7, 5, 1);
    });

    // Boss
    if (g.boss) {
      if (g.wd === 3) drawBossOcto(ctx);
      else if (g.wd === 2) drawBossCornudo(ctx);
      else drawBossMaligna(ctx);
    }

    // Boss Fireballs
    g.fb.forEach((f) => {
      ctx.fillStyle = '#f97316';
      ctx.fillRect(f.x, f.y, 8, 6);
      ctx.fillStyle = '#fd0';
      ctx.fillRect(f.x + 1, f.y + 2, 5, 2);
    });

    // Enemy Projectiles
    g.eb.forEach((b) => {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(b.x, b.y, 3, 5);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(b.x + 1, b.y + 1, 1, 3);
    });

    // Stars (Shurikens) with Glowing Spin
    g.st.forEach((s) => {
      renderSprite(ctx, STAR, s.x - 2, s.y - 1.5, 0.5);
    });

    // Coins & Stars Drops
    g.coins.forEach((c) => {
      if (c.type === 'star') {
        renderSprite(ctx, STAR, c.x - 2, c.y - 2, 0.4);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(c.x, c.y, 3.5, 3.5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(c.x + 0.8, c.y + 0.8, 1, 1);
      }
    });

    // Particles
    g.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // Player (Martín)
    if (g.inv % 8 < 4) {
      renderSprite(ctx, MA, g.P1.x, g.P1.y, 0.5, g.P1.dx < 0 ? 1 : 0);
    }

    // Floating Combat Texts
    g.floatingTexts.forEach((f) => {
      ctx.globalAlpha = f.alpha;
      renderText(ctx, f.text, f.x, f.y, f.size, f.color);
    });
    ctx.globalAlpha = 1;

    // Stage Announcement Banner
    if (g.msg > 0) {
      const bannerText =
        g.lvl === 21
          ? 'MUNDO 3: EL OCÉANO ABISAL'
          : g.lvl === 11
          ? 'MUNDO 2: EL BOSQUE MÁGICO'
          : g.L === 10
          ? g.wd === 3
            ? '¡DERROTA AL PULPO GIGANTE!'
            : g.wd === 2
            ? '¡VENCE A LA BESTIA CORNUDO!'
            : '¡VENCE A LA BRUJA MALIGNA!'
          : `NIVEL ${g.lvl}`;

      ctx.fillStyle = 'rgba(5, 7, 15, 0.75)';
      ctx.fillRect(0, 58, W, 22);
      ctx.fillStyle = activeSkinObj.glowColor;
      ctx.fillRect(0, 58, W, 1);
      ctx.fillRect(0, 79, W, 1);
      renderText(ctx, bannerText, 80, 72, 7, '#ffffff');
    }

    ctx.restore();
  };

  // Cover Screen
  const renderCover = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#060710';
    ctx.fillRect(0, 0, W, H);

    const g = gameRef.current;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
      ctx.fillRect((i * 37) % W, (i * 29) % H, 1, 1);
    }

    // Title hero center
    renderSprite(ctx, MA, 56, 42, 2.4, 0);
    renderSprite(ctx, STAR, 20, 68, 1.6);
    renderSprite(ctx, STAR, 126, 50, 1.6);

    renderText(ctx, 'ARCADE MARTÍN', 80, 24, 13, '#ffd700');
    renderText(ctx, 'GOLD EDITION', 80, 36, 8, '#38bdf8');

    renderText(ctx, 'Derrota a Maligna, Cornudo y el Pulpo', 80, 114, 6, '#94a3b8');

    if (g.t % 60 < 40) {
      renderText(ctx, 'ESPACIO O CLIC PARA JUGAR', 80, 130, 7, '#ffffff');
    }
  };

  // Continue Screen
  const renderContScr = (ctx: CanvasRenderingContext2D) => {
    const g = gameRef.current;
    renderBackground(ctx);
    ctx.fillStyle = 'rgba(10, 12, 22, 0.88)';
    ctx.fillRect(0, 35, W, 85);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 35, W, 1.5);
    ctx.fillRect(0, 119, W, 1.5);

    renderText(ctx, 'HAS CAÍDO EN COMBATE', 80, 56, 9, '#ef4444');
    renderText(ctx, '¿CONTINUAR AVENTURA?', 80, 72, 8, '#ffffff');
    renderText(ctx, `Nivel ${g.lvl} · Continuaciones: ${g.cont}`, 80, 88, 7, '#ffd700');

    if (g.t % 60 < 40 && g.t - g.dt > 40) {
      renderText(ctx, 'ESPACIO O CLIC PARA REVIVIR', 80, 105, 7, '#38bdf8');
    }
  };

  // Game Over & Victory Canvas Fallback
  const renderEndScreen = (ctx: CanvasRenderingContext2D, win: boolean) => {
    const g = gameRef.current;
    renderBackground(ctx);
    renderSprite(ctx, MA, 70, 95, 0.5);

    ctx.fillStyle = 'rgba(9, 10, 18, 0.88)';
    ctx.fillRect(0, 38, W, 78);
    ctx.fillStyle = win ? '#ffd700' : '#ef4444';
    ctx.fillRect(0, 38, W, 1.5);
    ctx.fillRect(0, 115, W, 1.5);

    renderText(ctx, win ? '¡VICTORIA ÉPICA!' : 'FIN DE LA PARTIDA', 80, 58, 11, win ? '#ffd700' : '#ef4444');
    renderText(
      ctx,
      win ? '¡Martín ha liberado los 3 Mundos!' : 'Los monstruos reclaman la victoria...',
      80,
      74,
      6.5,
      '#ffffff'
    );
    renderText(ctx, `PUNTOS: ${g.score} · MONEDAS: +${g.coinsThisRun}`, 80, 90, 7, '#ffd700');

    if (g.t % 60 < 40) {
      renderText(ctx, 'PULSA PARA VOLVER AL INICIO', 80, 106, 6.5, '#ffffff');
    }
  };

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W * S;
    canvas.height = H * S;

    const SPEED = 0.8;
    const STEP = 1000 / (60 * SPEED);
    let last = performance.now();
    let acc = 0;
    let animId: number;

    const loop = (now: number) => {
      acc += Math.min(now - last, 100);
      last = now;

      while (acc >= STEP) {
        acc -= STEP;
        if (!isPaused) {
          updateGame();
        }
      }

      ctx.setTransform(S, 0, 0, S, 0, 0);

      const g = gameRef.current;
      if (g.scene === 'play') drawScene(ctx);
      else if (g.scene === 'cover') renderCover(ctx);
      else if (g.scene === 'cont') renderContScr(ctx);
      else if (g.scene === 'over') renderEndScreen(ctx, false);
      else if (g.scene === 'win') renderEndScreen(ctx, true);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      soundEngine.stopMusic();
    };
  }, [isPaused]);

  // Key mappings
  useEffect(() => {
    const keyMap: Record<string, string> = {
      arrowleft: 'l',
      arrowright: 'r',
      arrowup: 'j',
      ' ': 'f',
      z: 'f',
      x: 'j',
      a: 'l',
      d: 'r',
      w: 'j',
      enter: 'f',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const k = e.key.toLowerCase();
      if (keyMap[k]) {
        gameRef.current.keys[keyMap[k]] = 1;
        if (!e.repeat) handleTap();
        e.preventDefault();
      }
      if (e.key === 'p' || e.key === 'Escape') {
        setIsPaused((p) => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (keyMap[k]) {
        gameRef.current.keys[keyMap[k]] = 0;
      }
    };

    const handleBlur = () => {
      gameRef.current.keys = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleTap]);

  // Virtual Controls for Mobile/Touch
  const setVirtualKey = (key: string, pressed: boolean) => {
    gameRef.current.keys[key] = pressed ? 1 : 0;
    if (pressed) handleTap();
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEngine.setMuted(!next);
    soundEngine.setMusicMuted(!next);
    onUpdateProfile((p) => ({ ...p, soundEnabled: next, musicEnabled: next }));
  };

  const toggleCrt = () => {
    const next = !crtOn;
    setCrtOn(next);
    onUpdateProfile((p) => ({ ...p, crtEnabled: next }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full min-h-[calc(100vh-4.5rem)] select-none bg-[#090a12] p-2 md:p-4 overflow-hidden"
    >
      {/* Upper In-Game HUD (Low Occlusion, Minimalist Dark) */}
      <div className="w-full max-w-4xl flex items-center justify-between px-3 py-2 mb-2 bg-[#10121d]/90 backdrop-blur-md border border-[#1f2338] rounded-xl shadow-lg text-xs md:text-sm text-slate-200">
        {/* Hearts and Lives */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-rose-500">
            {Array.from({ length: hudMaxHp }).map((_, i) => (
              <span
                key={i}
                className={`transition-all duration-200 ${
                  i < hudHp ? 'scale-100 text-rose-500 fill-rose-500 animate-pulse' : 'scale-90 text-slate-700'
                }`}
              >
                ♥
              </span>
            ))}
          </div>
          <span className="font-mono text-[11px] text-slate-400 border-l border-slate-700/60 pl-2">
            NV {hudLevel} {hudLevel > 20 ? '· Océano' : hudLevel > 10 ? '· Bosque' : '· Castillo'}
          </span>
        </div>

        {/* Combo Indicator */}
        {hudCombo > 1 && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-400 font-bold font-mono tracking-wider animate-bounce">
            <span>COMBO x{Math.min(5, 1 + Math.floor(hudCombo / 2))}</span>
            <span className="text-[10px] text-slate-400">({hudCombo} racha)</span>
          </div>
        )}

        {/* Score & Coins */}
        <div className="flex items-center gap-4 font-mono tabular-nums">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <span>🪙</span>
            <span>{hudCoins}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-100 font-bold tracking-wider">
            <span className="text-slate-400 text-xs">PTS:</span>
            <span>{hudScore.toLocaleString()}</span>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Pausar juego (P / Esc)"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              onClick={toggleSound}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Activar / Desactivar sonido"
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={toggleCrt}
              className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                crtOn ? 'text-cyan-400' : 'text-slate-500'
              }`}
              title="Modo Retro CRT Scanlines"
            >
              <Tv size={16} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Pantalla completa"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={onRequestDevMenu}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700"
              title="Menú Desarrollador / Selección de nivel"
            >
              DEV
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Container with CRT Retro Scanlines Overlay */}
      <div
        className="relative flex items-center justify-center border-2 border-amber-500/40 rounded-xl overflow-hidden shadow-2xl bg-black cursor-crosshair"
        style={{
          boxShadow: '0 0 35px -5px rgba(255, 215, 0, 0.15), 0 0 15px -3px rgba(0, 240, 255, 0.15)',
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleTap}
          className="w-[92vw] max-w-[calc((92vh-140px)*160/145)] md:max-w-[calc((88vh-130px)*160/145)] aspect-[160/145] h-auto block"
          style={{
            imageRendering: 'pixelated',
          }}
        />

        {/* Optional Scanlines CRT filter */}
        {crtOn && (
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0px, rgba(0, 0, 0, 0.4) 1px, transparent 1px, transparent 2px)',
            }}
          />
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs">
            <h2 className="text-2xl font-bold font-mono text-amber-400 tracking-wider mb-2">JUEGO EN PAUSA</h2>
            <p className="text-xs font-mono text-slate-300 mb-4">Pulsa ESPACIO o el botón para reanudar</p>
            <button
              onClick={() => setIsPaused(false)}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono tracking-wider shadow-lg transition-all"
            >
              REANUDAR
            </button>
          </div>
        )}
      </div>

      {/* Control Hints for Desktop */}
      <div className="hidden md:flex items-center justify-center gap-6 mt-3 text-xs font-mono text-slate-400">
        <span>← → o A / D : Mover</span>
        <span>↑ o W / X : Saltar & Aplastar</span>
        <span>ESPACIO o Z : Lanzar Shuriken</span>
        <span>P : Pausar</span>
      </div>

      {/* On-Screen Touch Virtual Gamepad for Mobile & Tablet */}
      <div className="md:hidden flex items-center justify-between w-full max-w-md px-4 mt-3">
        {/* Directional Pad */}
        <div className="flex gap-2">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setVirtualKey('l', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setVirtualKey('l', false);
            }}
            onPointerCancel={() => setVirtualKey('l', false)}
            className="w-14 h-14 rounded-full bg-[#181a29]/90 active:bg-amber-500 border border-slate-700 active:border-amber-400 text-white active:text-black text-2xl flex items-center justify-center shadow-lg touch-none transition-colors"
          >
            ◀
          </button>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setVirtualKey('r', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setVirtualKey('r', false);
            }}
            onPointerCancel={() => setVirtualKey('r', false)}
            className="w-14 h-14 rounded-full bg-[#181a29]/90 active:bg-amber-500 border border-slate-700 active:border-amber-400 text-white active:text-black text-2xl flex items-center justify-center shadow-lg touch-none transition-colors"
          >
            ▶
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setVirtualKey('j', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setVirtualKey('j', false);
            }}
            onPointerCancel={() => setVirtualKey('j', false)}
            className="w-14 h-14 rounded-full bg-[#1e293b]/90 active:bg-cyan-500 border border-cyan-500/40 text-cyan-400 active:text-black text-2xl flex items-center justify-center shadow-lg touch-none transition-colors"
            title="Saltar"
          >
            ⤒
          </button>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setVirtualKey('f', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setVirtualKey('f', false);
            }}
            onPointerCancel={() => setVirtualKey('f', false)}
            className="w-14 h-14 rounded-full bg-amber-500/20 active:bg-amber-500 border border-amber-500 text-amber-400 active:text-slate-950 text-2xl flex items-center justify-center shadow-lg touch-none transition-colors"
            title="Lanzar Shuriken"
          >
            ★
          </button>
        </div>
      </div>
    </div>
  );
};
