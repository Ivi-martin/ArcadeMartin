import { Skin, PlayerUpgrades } from '../types/game';

export interface UpgradeConfig {
  key: keyof PlayerUpgrades;
  name: string;
  description: string;
  icon: string;
  levels: {
    level: number;
    cost: number;
    effectDescription: string;
  }[];
}

export const UPGRADES_CONFIG: UpgradeConfig[] = [
  {
    key: 'cadence',
    name: 'Cadencia Ninja',
    description: 'Reduce el enfriamiento entre lanzamientos de estrellas ninja.',
    icon: 'Zap',
    levels: [
      { level: 1, cost: 150, effectDescription: 'Enfriamiento reducido a 12 frames (-15%)' },
      { level: 2, cost: 350, effectDescription: 'Enfriamiento reducido a 10 frames (-30%)' },
      { level: 3, cost: 700, effectDescription: 'Enfriamiento reducido a 8 frames (-45%)' },
      { level: 4, cost: 1200, effectDescription: 'Lluvia de estrellas: 6 frames (-60%)' },
    ],
  },
  {
    key: 'multiStar',
    name: 'Shuriken Múltiple',
    description: 'Lanza proyectiles simultáneos para dominar a grupos de enemigos.',
    icon: 'Sparkles',
    levels: [
      { level: 1, cost: 400, effectDescription: 'Doble estrella paralela' },
      { level: 2, cost: 1000, effectDescription: 'Estrella Triple en abanico letal' },
    ],
  },
  {
    key: 'maxHp',
    name: 'Vitalidad Dorada',
    description: 'Aumenta la salud máxima y resistencia a impactos de Martín.',
    icon: 'Heart',
    levels: [
      { level: 1, cost: 200, effectDescription: '+1 Corazón (6 vidas máx)' },
      { level: 2, cost: 450, effectDescription: '+2 Corazones (7 vidas máx)' },
      { level: 3, cost: 800, effectDescription: '+3 Corazones (8 vidas máx)' },
      { level: 4, cost: 1400, effectDescription: '+5 Corazones (10 vidas máx)' },
    ],
  },
  {
    key: 'magnet',
    name: 'Imán Celestial',
    description: 'Atrae automáticamente monedas y gemas cercanas hacia Martín.',
    icon: 'Magnet',
    levels: [
      { level: 1, cost: 250, effectDescription: 'Radio de atracción de 35px' },
      { level: 2, cost: 500, effectDescription: 'Radio de atracción ampliado a 65px' },
      { level: 3, cost: 900, effectDescription: 'Succión gravitacional de 110px' },
    ],
  },
  {
    key: 'speed',
    name: 'Botas Ágiles',
    description: 'Incrementa la velocidad de movimiento horizontal de Martín.',
    icon: 'Wind',
    levels: [
      { level: 1, cost: 180, effectDescription: '+12% de velocidad de carrera' },
      { level: 2, cost: 380, effectDescription: '+25% de velocidad de carrera' },
      { level: 3, cost: 750, effectDescription: '+40% de velocidad hipersónica' },
    ],
  },
  {
    key: 'jump',
    name: 'Salto Acrobático',
    description: 'Aumenta el impulso de salto y rebote al aplastar enemigos.',
    icon: 'ArrowUpCircle',
    levels: [
      { level: 1, cost: 200, effectDescription: '+10% altura de salto' },
      { level: 2, cost: 420, effectDescription: '+20% altura y tiempo en el aire' },
      { level: 3, cost: 800, effectDescription: 'Rebote superelástico de pisada' },
    ],
  },
  {
    key: 'piercing',
    name: 'Estrella Perforante',
    description: 'Los proyectiles atraviesan escudos y dañan objetivos múltiples.',
    icon: 'ShieldOff',
    levels: [
      { level: 1, cost: 650, effectDescription: 'Destruye escudos y atraviesa enemigos' },
    ],
  },
];

export const SKINS_CONFIG: Skin[] = [
  {
    id: 'classic',
    name: 'Martín Clásico',
    description: 'El traje tradicional azul marino y rojo de Martín Arcade.',
    cost: 0,
    unlocked: true,
    colors: {
      b: '#2a3a9a',
      B: '#3a5ad0',
      r: '#e22',
      R: '#900',
    },
    glowColor: '#3a5ad0',
    badge: 'Original',
  },
  {
    id: 'dark',
    name: 'Ninja Sombra',
    description: 'Traje de infiltración en obsidiana con ojos de cian brillante.',
    cost: 500,
    unlocked: false,
    colors: {
      b: '#18181b',
      B: '#3f3f46',
      r: '#06b6d4',
      R: '#0891b2',
    },
    glowColor: '#00f0ff',
    badge: 'Sigilo',
  },
  {
    id: 'cyber',
    name: 'Cyber Martín 2077',
    description: 'Armadura cibernética con circuitos de neón magenta y esmeralda.',
    cost: 1100,
    unlocked: false,
    colors: {
      b: '#0284c7',
      B: '#38bdf8',
      r: '#ec4899',
      R: '#be185d',
    },
    glowColor: '#f43f5e',
    badge: 'Cíber',
  },
  {
    id: 'ocean',
    name: 'Buzo Abisal',
    description: 'Especialista en aguas profundas con visor presurizado y aleta.',
    cost: 1800,
    unlocked: false,
    colors: {
      b: '#0d9488',
      B: '#14b8a6',
      r: '#f59e0b',
      R: '#b45309',
    },
    glowColor: '#10b981',
    badge: 'Acuático',
  },
  {
    id: 'gold',
    name: 'Campeón Dorado',
    description: 'Coraza forjada en oro puro con rubíes legendarios de la victoria.',
    cost: 3000,
    unlocked: false,
    colors: {
      b: '#b45309',
      B: '#f59e0b',
      r: '#ef4444',
      R: '#991b1b',
    },
    glowColor: '#ffd700',
    badge: 'Legendario',
  },
];
