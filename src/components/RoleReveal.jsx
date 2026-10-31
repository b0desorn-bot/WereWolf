import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Check, Moon, Shield, Sparkles, Users } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { TEAMS } from '../data/roles';
import { sound } from '../utils/audio';

export function RoleReveal() {
  const { gameState, confirmRoleSeen, beginFirstNight } = useGame();
  const [isRevealed, setIsRevealed] = useState(false);

  const me = gameState?.me;
  const roleInfo = me?.roleInfo;
  const isHost = me?.isHost;
  const players = gameState?.players || [];
  const teamInfo = roleInfo ? TEAMS[roleInfo.team.toUpperCase()] : null;

  const handleTouchStart = (e) => {
    // Prevent default context menu on long press on iOS/Android
    e.preventDefault();
    sound.playReveal();
    setIsRevealed(true);
  };

  const handleTouchEnd = () => {
    setIsRevealed(false);
  };

  const handleConfirmReady = () => {
    sound.playClick();
    confirmRoleSeen();
  };

  const allReady = players.every(p => p.hasSeenRole);

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 flex flex-col items-center justify-center min-h-[80vh]">
      {/* Title */}
      <div className="text-center">
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">
          แจกการ์ดบทบาทลับ
        </span>
        <h2 className="text-2xl font-black text-white mt-1">
          การ์ดประจำตัวของคุณ
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          ระวังคนข้างๆ แอบมอง! แตะค้างไว้เพื่อดูบทบาทลับ
        </p>
      </div>

      {/* Secret 3D Flip Card */}
      <div className="w-72 sm:w-80 h-96 perspective-1000 select-none">
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => { sound.playReveal(); setIsRevealed(true); }}
          onMouseUp={() => setIsRevealed(false)}
          onMouseLeave={() => setIsRevealed(false)}
          className={`relative w-full h-full rounded-3xl transition-transform duration-300 transform-style-3d cursor-pointer active:scale-95 shadow-2xl ${
            isRevealed ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Back (Locked / Hidden) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-2 border-purple-500/40 p-6 flex flex-col items-center justify-between backface-hidden shadow-purple-950/50">
            <div className="w-full flex items-center justify-between text-xs text-purple-300">
              <span className="font-mono tracking-widest font-bold">WEREWOLF</span>
              <span>DELUXE</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-4xl shadow-lg animate-pulse-slow">
                <Lock className="w-9 h-9 text-purple-300" />
              </div>
              <div>
                <p className="font-extrabold text-base text-white">
                  แตะค้างไว้เพื่อแอบดู
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  (เมื่อปล่อยนิ้ว การ์ดจะซ่อนตัวตนของคุณทันที)
                </p>
              </div>
            </div>

            <div className="w-full text-center text-[11px] text-purple-400/80 font-mono">
              แตะค้างที่นี่ • HOLD TO REVEAL
            </div>
          </div>

          {/* Card Front (Revealed Role Details) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-purple-400 p-6 flex flex-col items-center justify-between rotate-y-180 backface-hidden shadow-2xl overflow-hidden">
            {/* Top Team Badge */}
            <div className="w-full flex items-center justify-between">
              <span className={`text-[11px] px-3 py-1 rounded-full border ${teamInfo?.badgeBg} font-bold`}>
                {teamInfo?.name}
              </span>
              <span className="text-xs font-mono text-slate-400">
                คะแนน: {roleInfo?.weight > 0 ? `+${roleInfo?.weight}` : roleInfo?.weight}
              </span>
            </div>

            {/* Role Emoji & Name */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-2 filter drop-shadow-lg animate-bounce-subtle">
                {roleInfo?.emoji}
              </div>
              <h3 className="text-2xl font-black text-white tracking-wide">
                {roleInfo?.name}
              </h3>
              <p className="text-xs text-purple-300/90 font-medium mt-1">
                {teamInfo?.description}
              </p>
            </div>

            {/* Role Ability Box */}
            <div className="w-full p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>พลังและความสามารถ:</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                {roleInfo?.description}
              </p>
            </div>

            {/* Hint */}
            <div className="text-[10px] text-slate-500 italic">
              ปล่อยนิ้วเพื่อซ่อนการ์ด
            </div>
          </div>
        </div>
      </div>

      {/* Readiness Confirmation Button */}
      <div className="w-full space-y-3">
        {!me?.hasSeenRole ? (
          <button
            onClick={handleConfirmReady}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>ผม/ฉัน ทราบบทบาทของตัวเองแล้ว</span>
          </button>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>คุณพร้อมเล่นแล้ว! รอคนอื่นๆ ยืนยัน</span>
          </div>
        )}

        {/* Host Control: Begin First Night */}
        {isHost && (
          <div className="pt-2 border-t border-slate-800 text-center space-y-2">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>พร้อมแล้ว {players.filter(p => p.hasSeenRole).length} / {players.length} คน</span>
            </div>
            <button
              onClick={() => { sound.playNight(); beginFirstNight(); }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-700 to-slate-900 hover:from-indigo-500 hover:to-slate-800 active:scale-95 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all border border-indigo-400/30"
            >
              <Moon className="w-4 h-4 text-amber-300" />
              <span>เข้าสู่ค่ำคืนแรก (เริ่มเกม)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
