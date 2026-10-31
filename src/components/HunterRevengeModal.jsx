import React, { useState } from 'react';
import { Crosshair, Skull, AlertCircle } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { sound } from '../utils/audio';

export function HunterRevengeModal() {
  const { gameState, shootHunter } = useGame();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [shooting, setShooting] = useState(false);

  const me = gameState?.me;
  const isMeHunter = me?.pendingRevenge;
  const livingPlayers = (gameState?.players || []).filter(p => p.isAlive);

  if (gameState?.state !== 'HUNTER_REVENGE') return null;

  const handleShoot = async () => {
    if (!selectedTarget) return;
    sound.playDeath();
    setShooting(true);
    await shootHunter(selectedTarget);
    setShooting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-4xl shadow-xl animate-bounce-subtle">
          🏹
        </div>

        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            พลังพิเศษของนายพรานทำงาน!
          </span>
          <h3 className="text-2xl font-black text-white mt-1">
            {isMeHunter ? 'คุณคือนายพราน! จงเลือกคนตายตาม' : 'นายพรานกำลังเล็งเป้าหมาย...'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {isMeHunter
              ? 'คุณถูกสังหาร แต่กระสุนนัดสุดท้ายของคุณสามารถปลิดชีพผู้เล่นอีก 1 คนได้ทันที!'
              : 'นายพรานกำลังเลือกผู้เล่น 1 คนให้ตายตกตามกันในความเงียบงัน'}
          </p>
        </div>

        {isMeHunter ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto">
              {livingPlayers.filter(p => p.id !== me?.id).map((p) => {
                const isSelected = selectedTarget === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { sound.playClick(); setSelectedTarget(p.id); }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-500 shadow-md ring-1 ring-amber-500 scale-[1.02]'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <span className="text-2xl">{p.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-white truncate">{p.name}</p>
                      <span className="text-[10px] text-amber-300">
                        {isSelected ? '🎯 เล็งคนนี้' : 'แตะเพื่อเลือก'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleShoot}
              disabled={!selectedTarget || shooting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white font-extrabold text-base shadow-xl shadow-amber-950/60 disabled:opacity-30 active:scale-95 transition-all"
            >
              <Crosshair className="w-5 h-5 inline mr-1" />
              <span>ลั่นไกสังหารเป้าหมายทันที!</span>
            </button>
          </div>
        ) : (
          <div className="py-6 text-xs text-amber-300 animate-pulse">
            กรุณารอสักครู่... นายพรานกำลังตัดสินใจลั่นไก
          </div>
        )}
      </div>
    </div>
  );
}
