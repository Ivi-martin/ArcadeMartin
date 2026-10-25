import React, { useState } from 'react';
import { PlayerProfile, LeaderboardEntry } from '../types/game';
import {
  getStoredLeaderboard,
  getStoredFriendsLeaderboard,
  AVATAR_OPTIONS,
} from '../data/leaderboardData';
import { soundEngine } from '../audio/soundEngine';
import { Share2, Check, User, Crown, Flame } from 'lucide-react';

interface LeaderboardModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
  const [copied, setCopied] = useState<boolean>(false);
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(profile.name);
  const [tempAvatar, setTempAvatar] = useState<string>(profile.avatar);

  const globalList = getStoredLeaderboard();
  const friendsList = getStoredFriendsLeaderboard();

  // Insert or highlight player
  const currentList: LeaderboardEntry[] = (activeTab === 'global' ? globalList : friendsList).map(
    (entry) => {
      if (entry.isPlayer || entry.name === profile.name) {
        return {
          ...entry,
          score: Math.max(entry.score, profile.highScore),
          level: Math.max(entry.level, profile.highestLevel),
          avatar: profile.avatar,
          name: profile.name,
          isPlayer: true,
        };
      }
      return entry;
    }
  );

  // If player not in list, add them and sort
  const hasPlayer = currentList.some((e) => e.isPlayer);
  const fullList = hasPlayer
    ? currentList
    : [
        ...currentList,
        {
          id: 'me',
          name: profile.name,
          score: profile.highScore,
          level: profile.highestLevel,
          world: profile.highestLevel > 20 ? 3 : profile.highestLevel > 10 ? 2 : 1,
          avatar: profile.avatar,
          isPlayer: true,
          country: 'ES',
          date: 'Hoy',
        },
      ];

  const sortedList = [...fullList].sort((a, b) => b.score - a.score);
  const playerRank = sortedList.findIndex((e) => e.isPlayer) + 1;

  const handleShareScore = () => {
    soundEngine.playSound('coin');
    const text = `¡He alcanzado ${profile.highScore.toLocaleString()} puntos en el Nivel ${profile.highestLevel} en ARCADE MARTÍN Gold Edition! ¿Crees que puedes superarme? 🥷🔥`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveProfile = () => {
    soundEngine.playSound('upgrade');
    onUpdateProfile((prev) => ({
      ...prev,
      name: tempName.trim() || 'Martín',
      avatar: tempAvatar,
    }));
    setEditingProfile(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-wider text-white flex items-center gap-2">
            <span>TABLAS DE CLASIFICACIÓN</span>
            <span className="text-amber-400 text-sm font-bold">
              {playerRank > 0 ? `#${playerRank} en Ranking` : ''}
            </span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Compite con jugadores de todo el mundo y supera las puntuaciones de tus amigos
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#161a2e] hover:bg-[#1e233d] text-slate-200 border border-slate-700 transition-colors"
          >
            <User size={14} />
            <span>Editar GamerTag</span>
          </button>

          <button
            onClick={handleShareScore}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all active:scale-95"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            <span>{copied ? '¡Copiado!' : 'Retar Amigos'}</span>
          </button>
        </div>
      </div>

      {/* Profile Edit Drawer */}
      {editingProfile && (
        <div className="mb-6 p-4 rounded-xl bg-[#121528] border border-amber-500/40 shadow-lg animate-fadeIn">
          <h3 className="font-mono font-bold text-sm text-amber-400 mb-3">PERSONALIZA TU PERFIL DE JUGADOR</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Nombre o GamerTag</label>
              <input
                type="text"
                value={tempName}
                maxLength={18}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-[#181d33] border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                placeholder="Ej. MartinMaster"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Elige tu Avatar Arcade</label>
              <div className="flex flex-wrap gap-1.5">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    onClick={() => setTempAvatar(av)}
                    className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                      tempAvatar === av
                        ? 'bg-amber-500 text-slate-950 scale-110 shadow-md ring-2 ring-amber-400'
                        : 'bg-[#181d33] hover:bg-slate-700 text-white'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setEditingProfile(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'global'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Crown size={15} />
          <span>Top Mundial</span>
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'friends'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame size={15} />
          <span>Liga de Amigos</span>
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#101322] border border-[#1e233d] rounded-xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 px-4 py-3 bg-[#131728] border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          <div className="col-span-2 sm:col-span-1 text-center">Pos</div>
          <div className="col-span-6 sm:col-span-5">Jugador</div>
          <div className="col-span-2 sm:col-span-3 text-center">Mundo / Nivel</div>
          <div className="col-span-2 sm:col-span-3 text-right">Puntuación</div>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono text-xs">
          {sortedList.map((entry, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const isMe = entry.isPlayer;

            const worldLabel =
              entry.level > 20
                ? '🌊 Océano'
                : entry.level > 10
                ? '🌲 Bosque'
                : '🏰 Castillo';

            return (
              <div
                key={entry.id || index}
                className={`grid grid-cols-12 px-4 py-3 items-center transition-colors ${
                  isMe
                    ? 'bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-l-amber-400 font-bold'
                    : 'hover:bg-[#14182b]'
                }`}
              >
                {/* Rank Badge */}
                <div className="col-span-2 sm:col-span-1 text-center font-black">
                  {rank === 1 ? (
                    <span className="text-amber-400 text-sm">🥇 1</span>
                  ) : rank === 2 ? (
                    <span className="text-slate-300 text-sm">🥈 2</span>
                  ) : rank === 3 ? (
                    <span className="text-amber-700 text-sm">🥉 3</span>
                  ) : (
                    <span className="text-slate-500">#{rank}</span>
                  )}
                </div>

                {/* Player details */}
                <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-[#181d33] border border-slate-700 flex items-center justify-center text-sm">
                    {entry.avatar}
                  </div>
                  <div className="truncate">
                    <span className={`block truncate ${isMe ? 'text-amber-400' : 'text-slate-200'}`}>
                      {entry.name} {isMe && '(TÚ)'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {entry.country || 'ES'} · {entry.date}
                    </span>
                  </div>
                </div>

                {/* World / Level */}
                <div className="col-span-2 sm:col-span-3 text-center text-slate-300">
                  <span className="hidden sm:inline">{worldLabel} · </span>
                  <span className="text-cyan-300 font-bold">Nv {entry.level}</span>
                </div>

                {/* Score */}
                <div className="col-span-2 sm:col-span-3 text-right font-black tabular-nums text-amber-400 text-sm">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
