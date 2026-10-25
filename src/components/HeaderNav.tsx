import React from 'react';
import { PlayerProfile } from '../types/game';
import { Gamepad2, Zap, Gift, Trophy, Globe2, Download } from 'lucide-react';

export type ActiveTab = 'game' | 'shop' | 'daily' | 'achievements' | 'leaderboard';

interface HeaderNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: PlayerProfile;
  hasUnclaimedDaily: boolean;
  unclaimedAchievementsCount: number;
  onOpenDownload: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  profile,
  hasUnclaimedDaily,
  unclaimedAchievementsCount,
  onOpenDownload,
}) => {
  return (
    <header className="w-full bg-[#0d0f1a] border-b border-[#1b1f33] px-3 py-2.5 flex items-center justify-between select-none z-30 sticky top-0 shadow-md">
      {/* Brand & Logo */}
      <div
        onClick={() => setActiveTab('game')}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
          ★
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-wider text-sm text-white font-mono">ARCADE MARTÍN</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
              GOLD
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Action Platformer · 30 Niveles</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#131626] p-1 rounded-xl border border-[#212640]">
        <button
          onClick={() => setActiveTab('game')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'game'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Gamepad2 size={15} />
          <span className="hidden sm:inline">Jugar</span>
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'shop'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap size={15} />
          <span className="hidden sm:inline">Mejoras</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'daily'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Gift size={15} />
          <span className="hidden sm:inline">Diarias</span>
          {hasUnclaimedDaily && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          )}
          {hasUnclaimedDaily && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'achievements'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Trophy size={15} />
          <span className="hidden sm:inline">Logros</span>
          {unclaimedAchievementsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1 text-[9px] font-bold bg-amber-400 text-slate-950 rounded-full">
              {unclaimedAchievementsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Globe2 size={15} />
          <span className="hidden sm:inline">Ranking</span>
        </button>
      </nav>

      {/* Player Stats & Download Cluster */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Download App / Offline Button */}
        <button
          onClick={onOpenDownload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-mono text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          title="Descargar juego / Instalar aplicación en móvil o PC"
        >
          <Download size={14} className="stroke-[2.5]" />
          <span className="hidden md:inline">Descargar</span>
        </button>

        {/* Coins */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 font-mono text-xs text-amber-400 font-bold">
          <span>🪙</span>
          <span className="tabular-nums">{profile.coins.toLocaleString()}</span>
        </div>

        {/* Player Avatar */}
        <div
          onClick={() => setActiveTab('leaderboard')}
          className="w-8 h-8 rounded-lg bg-[#181b2e] border border-slate-700 flex items-center justify-center text-sm cursor-pointer hover:border-amber-400 transition-colors"
          title={`Perfil: ${profile.name}`}
        >
          <span>{profile.avatar}</span>
        </div>
      </div>
    </header>
  );
};
