import React from 'react';
import { Trophy, Coins } from 'lucide-react';

export interface UnlockedToastInfo {
  id: string;
  title: string;
  rewardCoins: number;
}

interface AchievementToastProps {
  toasts: UnlockedToastInfo[];
  onDismiss: (id: string) => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none select-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-[#131628]/95 border-2 border-amber-400 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md animate-bounce"
          style={{
            boxShadow: '0 0 20px -2px rgba(255, 215, 0, 0.4)',
          }}
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 text-lg">
            <Trophy size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              ¡Logro Desbloqueado!
            </span>
            <span className="block font-mono font-bold text-xs text-white">{toast.title}</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-amber-300">
              <Coins size={12} /> +{toast.rewardCoins} Monedas
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
