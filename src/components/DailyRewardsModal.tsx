import React, { useState, useEffect } from 'react';
import { PlayerProfile, SkinId } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { getTodayDateString } from '../utils/playerStorage';
import { Check, Flame, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyRewardsModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onUnlockAchievement: (id: string) => void;
}

interface DayRewardConfig {
  day: number;
  coins: number;
  stars?: number;
  bonusTitle: string;
  isGrandPrize?: boolean;
}

const REWARDS_SCHEDULE: DayRewardConfig[] = [
  { day: 1, coins: 150, bonusTitle: 'Bolsa de Monedas' },
  { day: 2, coins: 250, bonusTitle: '+1 Vida inicial' },
  { day: 3, coins: 400, stars: 1, bonusTitle: 'Gema Estelar' },
  { day: 4, coins: 600, bonusTitle: 'Potenciador Shuriken' },
  { day: 5, coins: 850, stars: 2, bonusTitle: 'Doble Gema Estelar' },
  { day: 6, coins: 1200, bonusTitle: 'Escudo Reflector' },
  { day: 7, coins: 2500, stars: 5, bonusTitle: '¡Traje Campeón Dorado!', isGrandPrize: true },
];

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  profile,
  onUpdateProfile,
  onUnlockAchievement,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  const today = getTodayDateString();
  const currentStreak = profile.dailyReward?.streak || 1;
  const isClaimedToday = profile.dailyReward?.claimedToday || profile.dailyReward?.lastClaimDate === today;

  // Countdown timer to next calendar reset (midnight)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimReward = () => {
    if (isClaimedToday) return;

    const rewardConfig = REWARDS_SCHEDULE[(currentStreak - 1) % 7];
    soundEngine.playSound('levelUp');
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#f59e0b', '#38bdf8', '#ec4899'],
    });

    // Check if day 7 grant skin
    if (rewardConfig.day === 7) {
      const ownedSkins: SkinId[] = JSON.parse(
        localStorage.getItem('arcade_martin_owned_skins') || '["classic"]'
      );
      if (!ownedSkins.includes('gold')) {
        ownedSkins.push('gold');
        localStorage.setItem('arcade_martin_owned_skins', JSON.stringify(ownedSkins));
      }
    }

    onUpdateProfile((prev) => {
      const nextStreak = prev.dailyReward.streak >= 7 ? 1 : prev.dailyReward.streak + 1;
      return {
        ...prev,
        coins: prev.coins + rewardConfig.coins,
        stars: prev.stars + (rewardConfig.stars || 0),
        dailyReward: {
          streak: nextStreak,
          lastClaimDate: today,
          claimedToday: true,
        },
      };
    });

    if (currentStreak >= 3) {
      onUnlockAchievement('streak_loyalty');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 select-none animate-fadeIn">
      {/* Header and Streak Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-wider text-white flex items-center gap-2">
            <span>RECOMPENSAS DIARIAS</span>
            <span className="text-amber-400 text-sm flex items-center gap-1 font-bold">
              <Flame size={16} className="text-amber-500 fill-amber-500 animate-pulse" />
              Racha Día {currentStreak} / 7
            </span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Conéctate cada día de forma consecutiva para desbloquear tesoros legendarios
          </p>
        </div>

        {/* Claim status badge */}
        <div className="flex items-center gap-2 bg-[#131626] px-3.5 py-1.5 rounded-xl border border-[#212640]">
          <Clock size={15} className="text-amber-400" />
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 font-mono uppercase">Siguiente ciclo</span>
            <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* 7-Day Calendar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
        {REWARDS_SCHEDULE.map((item) => {
          const isPassed = item.day < currentStreak || (item.day === currentStreak && isClaimedToday);
          const isCurrentActive = item.day === currentStreak && !isClaimedToday;
          const isUpcoming = item.day > currentStreak;

          return (
            <div
              key={item.day}
              className={`relative rounded-xl p-3 flex flex-col justify-between border transition-all ${
                isCurrentActive
                  ? 'bg-gradient-to-b from-amber-500/20 to-[#131628] border-amber-400 shadow-lg shadow-amber-500/10 scale-102 ring-2 ring-amber-400/20'
                  : isPassed
                  ? 'bg-[#10121d] border-slate-800 opacity-60'
                  : 'bg-[#101322] border-[#1d2238]'
              } ${item.isGrandPrize ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-300">DÍA {item.day}</span>
                {isPassed && (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[10px] text-emerald-400">
                    <Check size={10} />
                  </div>
                )}
                {isCurrentActive && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500 text-slate-950 font-black animate-pulse">
                    ¡HOY!
                  </span>
                )}
              </div>

              {/* Reward Icon & Value */}
              <div className="text-center my-3">
                <div className="text-3xl mb-1">{item.isGrandPrize ? '👑' : item.stars ? '⭐' : '🪙'}</div>
                <div className="font-mono font-black text-sm text-amber-400">+{item.coins}</div>
                {item.stars && (
                  <div className="font-mono text-[11px] font-bold text-cyan-300">+{item.stars} Estrellas</div>
                )}
              </div>

              {/* Bonus tag */}
              <div className="text-[10px] font-mono text-slate-400 text-center truncate border-t border-slate-800/80 pt-1.5">
                {item.bonusTitle}
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Action Bar */}
      <div className="bg-[#121526] border border-[#212642] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
            🎁
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-white">
              {isClaimedToday ? '¡Recompensa del día reclamada con éxito!' : '¡Tu recompensa diaria está lista para reclamar!'}
            </h3>
            <p className="text-xs font-mono text-slate-400">
              {isClaimedToday
                ? 'Regresa mañana para seguir subiendo tu racha y conseguir el Traje Dorado'
                : `Recibe +${REWARDS_SCHEDULE[(currentStreak - 1) % 7]?.coins} Monedas y bonificaciones`}
            </p>
          </div>
        </div>

        <button
          disabled={isClaimedToday}
          onClick={handleClaimReward}
          className={`w-full sm:w-auto px-8 py-3 rounded-xl font-mono text-xs font-black tracking-wider flex items-center justify-center gap-2 transition-all ${
            isClaimedToday
              ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer'
          }`}
        >
          {isClaimedToday ? (
            <>
              <Check size={16} />
              <span>RECLAMADO HOY</span>
            </>
          ) : (
            <>
              <span>RECLAMAR DÍA {currentStreak}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
