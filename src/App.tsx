import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProfile } from './types/game';
import { loadPlayerProfile, savePlayerProfile, getTodayDateString } from './utils/playerStorage';
import { HeaderNav, ActiveTab } from './components/HeaderNav';
import { GameCanvas } from './game/GameCanvas';
import { ProgressionShop } from './components/ProgressionShop';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { DevModal } from './components/DevModal';
import { GameOverModal } from './components/GameOverModal';
import { DownloadModal } from './components/DownloadModal';
import { AchievementToast, UnlockedToastInfo } from './components/AchievementToast';
import { INITIAL_ACHIEVEMENTS } from './data/achievementsData';
import { saveScoreToLeaderboard } from './data/leaderboardData';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [activeTab, setActiveTab] = useState<ActiveTab>('game');
  const [devModalOpen, setDevModalOpen] = useState<boolean>(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<UnlockedToastInfo[]>([]);
  const [selectedInitialLevel, setSelectedInitialLevel] = useState<number>(1);
  const [gameKey, setGameKey] = useState<number>(0);

  const [gameOverState, setGameOverState] = useState<{
    isOpen: boolean;
    isVictory: boolean;
    score: number;
    level: number;
    kills: number;
    coinsEarned: number;
    isNewHighScore: boolean;
  }>({
    isOpen: false,
    isVictory: false,
    score: 0,
    level: 1,
    kills: 0,
    coinsEarned: 0,
    isNewHighScore: false,
  });

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    savePlayerProfile(profile);
  }, [profile]);

  // Sync sound settings with sound engine on mount
  useEffect(() => {
    soundEngine.setMuted(!profile.soundEnabled);
    soundEngine.setMusicMuted(!profile.musicEnabled);
  }, [profile.soundEnabled, profile.musicEnabled]);

  // Achievement unlock handler with animated Toast
  const handleUnlockAchievement = useCallback(
    (id: string) => {
      const ach = INITIAL_ACHIEVEMENTS.find((a) => a.id === id);
      if (!ach) return;

      setProfile((prev) => {
        if (prev.unlockedAchievements && prev.unlockedAchievements.includes(id)) {
          return prev; // already unlocked
        }

        soundEngine.playSound('achievement');

        // Add toast
        setToasts((curr) => [
          ...curr,
          { id: ach.id, title: ach.title, rewardCoins: ach.rewardCoins },
        ]);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
          setToasts((curr) => curr.filter((t) => t.id !== ach.id));
        }, 4000);

        return {
          ...prev,
          coins: prev.coins + ach.rewardCoins,
          unlockedAchievements: [...(prev.unlockedAchievements || []), id],
        };
      });
    },
    []
  );

  // Game Over trigger
  const handleGameOver = useCallback(
    (stats: { score: number; level: number; kills: number; coinsEarned: number }) => {
      const isNewRecord = stats.score > profile.highScore;

      // Save to global & friends leaderboards
      saveScoreToLeaderboard(profile.name, stats.score, stats.level, profile.avatar);

      setProfile((prev) => ({
        ...prev,
        highScore: Math.max(prev.highScore, stats.score),
        highestLevel: Math.max(prev.highestLevel, stats.level),
        totalKills: prev.totalKills + stats.kills,
        gamesPlayed: prev.gamesPlayed + 1,
      }));

      setGameOverState({
        isOpen: true,
        isVictory: false,
        score: stats.score,
        level: stats.level,
        kills: stats.kills,
        coinsEarned: stats.coinsEarned,
        isNewHighScore: isNewRecord,
      });
    },
    [profile.highScore, profile.name, profile.avatar]
  );

  // Victory trigger
  const handleVictory = useCallback(
    (stats: { score: number; level: number; kills: number; coinsEarned: number }) => {
      const isNewRecord = stats.score > profile.highScore;

      saveScoreToLeaderboard(profile.name, stats.score, stats.level, profile.avatar);

      setProfile((prev) => ({
        ...prev,
        highScore: Math.max(prev.highScore, stats.score),
        highestLevel: Math.max(prev.highestLevel, stats.level),
        totalKills: prev.totalKills + stats.kills,
        bossesDefeated: prev.bossesDefeated + 1,
        gamesPlayed: prev.gamesPlayed + 1,
      }));

      setGameOverState({
        isOpen: true,
        isVictory: true,
        score: stats.score,
        level: stats.level,
        kills: stats.kills,
        coinsEarned: stats.coinsEarned,
        isNewHighScore: isNewRecord,
      });
    },
    [profile.highScore, profile.name, profile.avatar]
  );

  const handleRestartFromModal = () => {
    setGameOverState((prev) => ({ ...prev, isOpen: false }));
    setActiveTab('game');
    setGameKey((k) => k + 1);
  };

  const handleGoToShop = () => {
    setGameOverState((prev) => ({ ...prev, isOpen: false }));
    setActiveTab('shop');
  };

  const handleGoToLeaderboard = () => {
    setGameOverState((prev) => ({ ...prev, isOpen: false }));
    setActiveTab('leaderboard');
  };

  const handleSelectLevel = (lvl: number) => {
    setSelectedInitialLevel(lvl);
    setActiveTab('game');
    setGameKey((k) => k + 1);
  };

  const today = getTodayDateString();
  const hasUnclaimedDaily = !profile.dailyReward?.claimedToday && profile.dailyReward?.lastClaimDate !== today;

  const unlockedSet = new Set(profile.unlockedAchievements || []);
  const unclaimedAchievementsCount = INITIAL_ACHIEVEMENTS.filter((a) => {
    if (unlockedSet.has(a.id)) return false;
    // Check if eligible
    return false;
  }).length;

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        hasUnclaimedDaily={hasUnclaimedDaily}
        unclaimedAchievementsCount={unclaimedAchievementsCount}
        onOpenDownload={() => setDownloadModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        {activeTab === 'game' && (
          <GameCanvas
            key={gameKey}
            profile={profile}
            onUpdateProfile={setProfile}
            onGameOver={handleGameOver}
            onVictory={handleVictory}
            onUnlockAchievement={handleUnlockAchievement}
            onRequestDevMenu={() => setDevModalOpen(true)}
            initialLevel={selectedInitialLevel}
          />
        )}

        {activeTab === 'shop' && (
          <ProgressionShop
            profile={profile}
            onUpdateProfile={setProfile}
            onUnlockAchievement={handleUnlockAchievement}
          />
        )}

        {activeTab === 'daily' && (
          <DailyRewardsModal
            profile={profile}
            onUpdateProfile={setProfile}
            onUnlockAchievement={handleUnlockAchievement}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsModal
            profile={profile}
            onUpdateProfile={setProfile}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardModal
            profile={profile}
            onUpdateProfile={setProfile}
          />
        )}
      </main>

      {/* Floating Real-time Achievement Toast */}
      <AchievementToast
        toasts={toasts}
        onDismiss={(id) => setToasts((curr) => curr.filter((t) => t.id !== id))}
      />

      {/* Game Over / Victory Modal */}
      <GameOverModal
        isOpen={gameOverState.isOpen}
        isVictory={gameOverState.isVictory}
        score={gameOverState.score}
        level={gameOverState.level}
        kills={gameOverState.kills}
        coinsEarned={gameOverState.coinsEarned}
        isNewHighScore={gameOverState.isNewHighScore}
        onRestart={handleRestartFromModal}
        onGoToShop={handleGoToShop}
        onGoToLeaderboard={handleGoToLeaderboard}
      />

      {/* Developer Cheat & Warp Modal */}
      <DevModal
        isOpen={devModalOpen}
        onClose={() => setDevModalOpen(false)}
        onSelectLevel={handleSelectLevel}
        profile={profile}
        onUpdateProfile={setProfile}
      />

      {/* Download & Offline Install Modal */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </div>
  );
}
