import React, { useState } from 'react';
import { PlayerProfile, Achievement } from '../types/game';
import { INITIAL_ACHIEVEMENTS } from '../data/achievementsData';
import { soundEngine } from '../audio/soundEngine';
import { Trophy, Check, Award, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AchievementsModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Compute progress for each achievement based on profile stats
  const getAchievementProgress = (achievement: Achievement): number => {
    switch (achievement.id) {
      case 'first_kill':
        return Math.min(1, profile.totalKills);
      case 'combo_frenzy':
        return Math.min(5, profile.highestCombo);
      case 'stomp_master':
        return Math.min(15, profile.totalStomps);
      case 'aerial_ace':
        return Math.min(20, profile.totalKills);
      case 'world1_cleared':
        return profile.highestLevel >= 11 ? 1 : 0;
      case 'world2_cleared':
        return profile.highestLevel >= 21 ? 1 : 0;
      case 'game_completed':
        return profile.highestLevel >= 30 ? 1 : 0;
      case 'coin_hoarder':
        return Math.min(1500, profile.coins);
      case 'streak_loyalty':
        return Math.min(3, profile.dailyReward?.streak || 1);
      case 'shuriken_expert':
        return profile.upgrades.multiStar >= 1 ? 1 : 0;
      case 'score_champ':
        return Math.min(3500, profile.highScore);
      case 'shield_breaker':
        return Math.min(10, profile.totalKills);
      default:
        return 0;
    }
  };

  const unlockedIds = new Set(profile.unlockedAchievements || []);

  const achievementsWithStatus = INITIAL_ACHIEVEMENTS.map((ach) => {
    const progress = getAchievementProgress(ach);
    const isReadyOrUnlocked = unlockedIds.has(ach.id) || progress >= ach.maxProgress;
    return {
      ...ach,
      progress,
      unlocked: isReadyOrUnlocked,
    };
  });

  const filtered =
    filterCategory === 'all'
      ? achievementsWithStatus
      : achievementsWithStatus.filter((a) => a.category === filterCategory);

  const totalUnlocked = achievementsWithStatus.filter((a) => a.unlocked).length;

  const handleClaim = (ach: Achievement) => {
    if (unlockedIds.has(ach.id)) return; // already claimed
    soundEngine.playSound('achievement');
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

    onUpdateProfile((prev) => ({
      ...prev,
      coins: prev.coins + ach.rewardCoins,
      unlockedAchievements: [...(prev.unlockedAchievements || []), ach.id],
    }));
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { border: 'border-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'PLATINO' };
      case 'gold':
        return { border: 'border-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'ORO' };
      case 'silver':
        return { border: 'border-slate-300', text: 'text-slate-300', bg: 'bg-slate-400/10', label: 'PLATA' };
      default:
        return { border: 'border-amber-700', text: 'text-amber-600', bg: 'bg-amber-900/10', label: 'BRONCE' };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 select-none animate-fadeIn">
      {/* Header & Overall Progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-wider text-white flex items-center gap-2">
            <span>SALA DE LOGROS</span>
            <span className="text-amber-400 text-sm font-bold">
              ({totalUnlocked} / {INITIAL_ACHIEVEMENTS.length})
            </span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Supera hitos de combate, exploración y maestría para obtener recompensas doradas
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap items-center bg-[#131626] p-1 rounded-xl border border-[#212640] gap-1">
          {['all', 'combat', 'boss', 'progression', 'mastery'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                filterCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all'
                ? 'Todos'
                : cat === 'combat'
                ? 'Combate'
                : cat === 'boss'
                ? 'Jefes'
                : cat === 'progression'
                ? 'Progreso'
                : 'Maestría'}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar Total */}
      <div className="w-full bg-[#131628] rounded-full h-2 mb-6 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-amber-500 to-cyan-400 h-full transition-all duration-500"
          style={{ width: `${(totalUnlocked / INITIAL_ACHIEVEMENTS.length) * 100}%` }}
        />
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((ach) => {
          const tier = getTierBadge(ach.tier);
          const isClaimed = unlockedIds.has(ach.id);
          const isComplete = ach.progress >= ach.maxProgress;
          const percent = Math.min(100, Math.floor((ach.progress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                isClaimed
                  ? 'bg-[#101322] border-slate-800 opacity-80'
                  : isComplete
                  ? 'bg-gradient-to-br from-amber-500/10 to-[#12162a] border-amber-500/60 shadow-lg shadow-amber-500/10'
                  : 'bg-[#101322] border-[#1d2238]'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border ${tier.border} ${tier.bg} text-lg`}
                    >
                      {ach.unlocked ? '🏆' : '🔒'}
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
                        <span>{ach.title}</span>
                      </h3>
                      <span className={`text-[9px] font-mono font-bold tracking-wider ${tier.text}`}>
                        {tier.label}
                      </span>
                    </div>
                  </div>

                  {/* Reward Badge */}
                  <div className="flex items-center gap-1 font-mono text-xs text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    <span>🪙</span>
                    <span>+{ach.rewardCoins}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-mono mb-3">{ach.description}</p>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Progreso</span>
                    <span>
                      {ach.progress} / {ach.maxProgress} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#181d33] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status / Claim CTA */}
              <div>
                {isClaimed ? (
                  <div className="w-full py-1.5 text-center font-mono text-xs text-slate-500 flex items-center justify-center gap-1.5 bg-slate-900/60 rounded-lg">
                    <Check size={14} className="text-emerald-400" />
                    <span>DESBLOQUEADO</span>
                  </div>
                ) : isComplete ? (
                  <button
                    onClick={() => handleClaim(ach)}
                    className="w-full py-2 rounded-lg font-mono text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-md animate-pulse cursor-pointer"
                  >
                    <Coins size={14} />
                    <span>RECLAMAR RECOMPENSA</span>
                  </button>
                ) : (
                  <div className="w-full py-1.5 text-center font-mono text-xs text-slate-500 bg-slate-900/40 rounded-lg">
                    EN PROGRESO
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
