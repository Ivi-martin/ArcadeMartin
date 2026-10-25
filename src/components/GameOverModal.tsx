import React from 'react';
import { Trophy, RotateCcw, Zap, Globe2, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  score: number;
  level: number;
  kills: number;
  coinsEarned: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onGoToShop: () => void;
  onGoToLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isVictory,
  score,
  level,
  kills,
  coinsEarned,
  isNewHighScore,
  onRestart,
  onGoToShop,
  onGoToLeaderboard,
}) => {
  if (!isOpen) return null;

  const worldName =
    level > 20 ? 'Mundo 3: El Océano' : level > 10 ? 'Mundo 2: El Bosque' : 'Mundo 1: El Castillo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div
        className={`w-full max-w-md bg-[#111322] border rounded-2xl p-6 shadow-2xl text-center font-mono ${
          isVictory ? 'border-amber-400 shadow-amber-500/20' : 'border-rose-500/40 shadow-rose-500/10'
        }`}
      >
        {/* Banner */}
        <div className="mb-4">
          <div className="text-4xl mb-2">{isVictory ? '👑' : '💀'}</div>
          <h2
            className={`text-2xl font-black tracking-wider ${
              isVictory ? 'text-amber-400' : 'text-rose-500'
            }`}
          >
            {isVictory ? '¡VICTORIA LEGENDARIA!' : 'FIN DE LA PARTIDA'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isVictory
              ? '¡Martín ha derrotado a todos los jefes y liberado los 3 Mundos!'
              : 'Has caído en combate. ¡Mejora tu equipo y regresa más fuerte!'}
          </p>
        </div>

        {/* High Score Celebration Badge */}
        {isNewHighScore && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs mb-4 animate-bounce">
            <Sparkles size={14} />
            <span>¡NUEVO RÉCORD PERSONAL!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 bg-[#171a2e] border border-slate-800 rounded-xl p-3.5 mb-6 text-left text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Puntos Logrados</span>
            <span className="text-base font-black text-amber-400 tabular-nums">{score.toLocaleString()}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Nivel Alcanzado</span>
            <span className="text-base font-black text-cyan-400 tabular-nums">
              Nv {level} <span className="text-[10px] text-slate-400 font-normal">({worldName})</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Monedas Ganadas</span>
            <span className="text-base font-black text-amber-300 tabular-nums flex items-center gap-1">
              <span>🪙</span> +{coinsEarned}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Monstruos Eliminados</span>
            <span className="text-base font-black text-rose-400 tabular-nums">☠ {kills}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>JUGAR DE NUEVO (ESPACIO)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onGoToShop}
              className="py-2.5 rounded-xl font-bold text-xs bg-[#1a1e36] hover:bg-[#222847] text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap size={14} className="text-amber-400" />
              <span>Mejorar Héroe</span>
            </button>

            <button
              onClick={onGoToLeaderboard}
              className="py-2.5 rounded-xl font-bold text-xs bg-[#1a1e36] hover:bg-[#222847] text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe2 size={14} className="text-cyan-400" />
              <span>Ver Ranking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
