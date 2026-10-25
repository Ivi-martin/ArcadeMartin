import React, { useState } from 'react';
import { PlayerProfile } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { X, Key, Zap, RotateCcw } from 'lucide-react';

interface DevModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (lvl: number) => void;
  profile: PlayerProfile;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
}

export const DevModal: React.FC<DevModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  onUpdateProfile,
}) => {
  const [passcode, setPasscode] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234' || passcode === 'admin') {
      setIsUnlocked(true);
      setErrorMsg('');
      soundEngine.playSound('levelUp');
    } else {
      setErrorMsg('Clave incorrecta. Pista: 1234');
      soundEngine.playSound('hurt');
    }
  };

  const handleAddCoins = () => {
    soundEngine.playSound('coin');
    onUpdateProfile((p) => ({ ...p, coins: p.coins + 1000 }));
  };

  const handleResetProgress = () => {
    if (window.confirm('¿Seguro que deseas reiniciar tu progreso y monedas?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-[#121526] border border-amber-500/50 rounded-2xl p-5 shadow-2xl relative text-slate-200 font-mono">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4 text-amber-400">
          <Key size={20} />
          <h2 className="text-base font-bold tracking-wider">MODO DESARROLLADOR ARCADE</h2>
        </div>

        {!isUnlocked ? (
          <form onSubmit={handleUnlock} className="space-y-4">
            <p className="text-xs text-slate-400">
              Introduce la clave de desarrollador para desbloquear selección de mundos y herramientas de test.
            </p>
            <input
              type="password"
              inputMode="numeric"
              placeholder="Introduce clave (1234)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-[#181d33] border border-slate-700 rounded-lg px-3 py-2 text-sm text-center text-white focus:outline-none focus:border-amber-400"
              autoFocus
            />
            {errorMsg && <p className="text-xs text-rose-400 text-center">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              ACCEDER
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2 uppercase">Teletransporte a Nivel (1 - 30)</label>
              <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {Array.from({ length: 30 }).map((_, i) => {
                  const lvl = i + 1;
                  const isBoss = lvl === 10 || lvl === 20 || lvl === 30;
                  return (
                    <button
                      key={lvl}
                      onClick={() => {
                        onSelectLevel(lvl);
                        onClose();
                      }}
                      className={`py-1.5 rounded text-xs font-bold transition-all ${
                        isBoss
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500 hover:text-white'
                          : 'bg-[#181d33] hover:bg-amber-500 hover:text-slate-950 text-slate-300'
                      }`}
                    >
                      {lvl} {isBoss && '👹'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Testing Tools */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={handleAddCoins}
                className="flex-1 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Zap size={14} />
                <span>+1,000 Monedas</span>
              </button>

              <button
                onClick={handleResetProgress}
                className="py-2 px-3 rounded-lg bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-1"
                title="Reiniciar partida"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
