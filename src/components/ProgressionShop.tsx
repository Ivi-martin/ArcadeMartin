import React, { useState } from 'react';
import { PlayerProfile, SkinId } from '../types/game';
import { UPGRADES_CONFIG, SKINS_CONFIG } from '../data/upgradesData';
import { soundEngine } from '../audio/soundEngine';
import { Zap, Shield, Heart, Wind, Magnet, ArrowUpCircle, Sparkles, Check, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProgressionShopProps {
  profile: PlayerProfile;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onUnlockAchievement: (id: string) => void;
}

export const ProgressionShop: React.FC<ProgressionShopProps> = ({
  profile,
  onUpdateProfile,
  onUnlockAchievement,
}) => {
  const [activeTab, setActiveTab] = useState<'upgrades' | 'skins'>('upgrades');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap size={18} className="text-amber-400" />;
      case 'Sparkles':
        return <Sparkles size={18} className="text-cyan-400" />;
      case 'Heart':
        return <Heart size={18} className="text-rose-400" />;
      case 'Magnet':
        return <Magnet size={18} className="text-indigo-400" />;
      case 'Wind':
        return <Wind size={18} className="text-emerald-400" />;
      case 'ArrowUpCircle':
        return <ArrowUpCircle size={18} className="text-sky-400" />;
      default:
        return <Shield size={18} className="text-amber-400" />;
    }
  };

  const handleBuyUpgrade = (key: keyof typeof profile.upgrades) => {
    const config = UPGRADES_CONFIG.find((u) => u.key === key);
    if (!config) return;

    const currentLevel = profile.upgrades[key];
    const nextTier = config.levels[currentLevel];
    if (!nextTier) return; // already max

    if (profile.coins < nextTier.cost) {
      soundEngine.playSound('hurt');
      return;
    }

    soundEngine.playSound('upgrade');
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });

    onUpdateProfile((prev) => ({
      ...prev,
      coins: prev.coins - nextTier.cost,
      upgrades: {
        ...prev.upgrades,
        [key]: currentLevel + 1,
      },
    }));

    if (key === 'multiStar' && currentLevel + 1 >= 1) {
      onUnlockAchievement('shuriken_expert');
    }
  };

  const handleEquipOrBuySkin = (skinId: SkinId, cost: number) => {
    const isUnlocked = skinId === 'classic' || profile.activeSkin === skinId || profile.coins >= cost;
    const skin = SKINS_CONFIG.find((s) => s.id === skinId);
    if (!skin) return;

    if (skinId === profile.activeSkin) return;

    // Check if user already owns it or can buy it
    // We can store owned skins in localStorage or profile
    const ownedSkins: SkinId[] = JSON.parse(
      localStorage.getItem('arcade_martin_owned_skins') || '["classic"]'
    );

    if (ownedSkins.includes(skinId)) {
      // Just equip
      soundEngine.playSound('coin');
      onUpdateProfile((prev) => ({ ...prev, activeSkin: skinId }));
    } else {
      // Must buy
      if (profile.coins < cost) {
        soundEngine.playSound('hurt');
        return;
      }

      soundEngine.playSound('upgrade');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      const newOwned = [...ownedSkins, skinId];
      localStorage.setItem('arcade_martin_owned_skins', JSON.stringify(newOwned));

      onUpdateProfile((prev) => ({
        ...prev,
        coins: prev.coins - cost,
        activeSkin: skinId,
      }));
    }
  };

  const ownedSkinsList: SkinId[] = JSON.parse(
    localStorage.getItem('arcade_martin_owned_skins') || '["classic"]'
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 select-none animate-fadeIn">
      {/* Header Cluster */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-wider text-white flex items-center gap-2">
            <span>ARMERÍA & MEJORAS</span>
            <span className="text-amber-400 text-sm font-normal">v3.0</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Potencia a Martín con habilidades permanentes y nuevos trajes de batalla
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#131626] p-1 rounded-xl border border-[#212640]">
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'upgrades'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Habilidades ({UPGRADES_CONFIG.length})
          </button>
          <button
            onClick={() => setActiveTab('skins')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'skins'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Trajes Ninja ({SKINS_CONFIG.length})
          </button>
        </div>
      </div>

      {/* Upgrades Catalog View */}
      {activeTab === 'upgrades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {UPGRADES_CONFIG.map((upgrade) => {
            const currentLevel = profile.upgrades[upgrade.key];
            const maxLevel = upgrade.levels.length;
            const isMax = currentLevel >= maxLevel;
            const nextTier = !isMax ? upgrade.levels[currentLevel] : null;
            const canAfford = nextTier ? profile.coins >= nextTier.cost : false;

            return (
              <div
                key={upgrade.key}
                className="bg-[#101322] border border-[#1e233d] hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#181d33] border border-slate-700 flex items-center justify-center">
                        {getIcon(upgrade.icon)}
                      </div>
                      <div>
                        <h3 className="font-mono font-bold text-sm text-slate-100">{upgrade.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400">
                          Nivel {currentLevel} / {maxLevel}
                        </span>
                      </div>
                    </div>

                    {/* Level pips */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: maxLevel }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-xs transition-colors ${
                            i < currentLevel ? 'bg-amber-400 shadow-xs shadow-amber-400/50' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-mono mb-3">{upgrade.description}</p>

                  {/* Current / Next effect */}
                  <div className="bg-[#15192c] rounded-lg p-2.5 mb-3 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                      {isMax ? 'Efecto al máximo' : 'Siguiente nivel:'}
                    </span>
                    <span className="text-cyan-300 font-semibold">
                      {isMax ? 'Habilidad al 100% de potencia' : nextTier?.effectDescription}
                    </span>
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  disabled={isMax || !canAfford}
                  onClick={() => handleBuyUpgrade(upgrade.key)}
                  className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isMax
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default'
                      : canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10 active:scale-[0.98]'
                      : 'bg-slate-800/60 border border-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isMax ? (
                    <>
                      <Check size={14} />
                      <span>NIVEL MÁXIMO</span>
                    </>
                  ) : (
                    <>
                      <span>MEJORAR POR</span>
                      <span className="flex items-center gap-1 text-slate-950 font-black">
                        🪙 {nextTier?.cost}
                      </span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Character Skins Showcase */}
      {activeTab === 'skins' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SKINS_CONFIG.map((skin) => {
            const isOwned = ownedSkinsList.includes(skin.id);
            const isEquipped = profile.activeSkin === skin.id;
            const canAfford = profile.coins >= skin.cost;

            return (
              <div
                key={skin.id}
                className={`bg-[#101322] border rounded-xl p-4 flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'border-amber-400/80 shadow-md shadow-amber-400/10'
                    : 'border-[#1e233d] hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Skin Avatar Preview */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border"
                      style={{
                        backgroundColor: skin.colors.b,
                        borderColor: skin.glowColor,
                        boxShadow: `0 0 15px -2px ${skin.glowColor}40`,
                      }}
                    >
                      <span>🥷</span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {skin.badge}
                    </span>
                  </div>

                  <h3 className="font-mono font-bold text-sm text-slate-100">{skin.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 mb-4">{skin.description}</p>
                </div>

                {/* Skin Button */}
                <button
                  disabled={isEquipped || (!isOwned && !canAfford)}
                  onClick={() => handleEquipOrBuySkin(skin.id, skin.cost)}
                  className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isEquipped
                      ? 'bg-amber-400/10 border border-amber-400/30 text-amber-400 cursor-default'
                      : isOwned
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                      : canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-slate-800/40 border border-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isEquipped ? (
                    <>
                      <Check size={14} />
                      <span>EQUIPADO</span>
                    </>
                  ) : isOwned ? (
                    <span>EQUIPAR</span>
                  ) : (
                    <>
                      <Lock size={12} />
                      <span>DESBLOQUEAR (🪙 {skin.cost})</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
