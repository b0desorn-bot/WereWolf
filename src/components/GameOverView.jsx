import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Skull, CheckCircle, Heart, Users, Sparkles } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { ROLES, TEAMS } from '../data/roles';
import { sound } from '../utils/audio';

export function GameOverView() {
  const { gameState, restartGame } = useGame();
  const isHost = gameState?.me?.isHost;
  const winner = gameState?.winner;
  const winReason = gameState?.winReason;
  const players = gameState?.players || [];

  useEffect(() => {
    sound.playVictory();
    // Launch celebratory confetti bursts
    const end = Date.now() + 3 * 1000;
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const getWinnerBanner = () => {
    switch (winner) {
      case 'villagers':
        return {
          title: 'ฝ่ายชาวบ้านเป็นผู้ชนะ!',
          emoji: '🧑‍🌾',
          bg: 'from-emerald-600 via-teal-600 to-indigo-700',
          textColor: 'text-emerald-300'
        };
      case 'werewolves':
        return {
          title: 'ฝ่ายมนุษย์หมาป่าเป็นผู้ชนะ!',
          emoji: '🐺',
          bg: 'from-red-600 via-rose-700 to-slate-900',
          textColor: 'text-rose-300'
        };
      case 'tanner':
        return {
          title: 'คนฟอกหนังเป็นผู้ชนะเพียงคนเดียว!',
          emoji: '🎭',
          bg: 'from-amber-600 via-orange-600 to-yellow-600',
          textColor: 'text-amber-300'
        };
      case 'lovers':
        return {
          title: 'คู่รักชะตากรรมเป็นผู้ชนะ!',
          emoji: '💘',
          bg: 'from-pink-600 via-rose-600 to-purple-600',
          textColor: 'text-pink-300'
        };
      default:
        return {
          title: 'จบเกม!',
          emoji: '🏆',
          bg: 'from-purple-600 to-indigo-600',
          textColor: 'text-purple-300'
        };
    }
  };

  const banner = getWinnerBanner();

  const handleRestart = () => {
    sound.playClick();
    restartGame();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 pb-20">
      {/* Victory Header Card */}
      <div className={`p-8 rounded-3xl bg-gradient-to-r ${banner.bg} text-white text-center shadow-2xl relative overflow-hidden`}>
        <div className="text-6xl mb-3 animate-bounce-subtle">
          {banner.emoji}
        </div>
        <span className="text-xs font-bold uppercase tracking-widest bg-black/30 px-3 py-1 rounded-full">
          บทสรุปของสงครามแห่งราตรี
        </span>
        <h2 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
          {banner.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-100/90 max-w-lg mx-auto mt-2 font-medium leading-relaxed">
          {winReason}
        </p>
      </div>

      {/* Complete Player Roles Reveal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-base text-white">
              เปิดเผยตัวตนที่แท้จริงของผู้เล่นทุกคน
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {players.length} ผู้เล่น
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
          {players.map((p) => {
            const role = ROLES[p.role];
            const team = role ? TEAMS[role.team.toUpperCase()] : null;
            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  p.isAlive
                    ? 'bg-slate-950/80 border-slate-700/80'
                    : 'bg-slate-950/40 border-slate-800/40 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl shrink-0">{p.avatar}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-white truncate">{p.name}</span>
                      {p.loverId && <span title="มีคู่รัก" className="text-xs">❤️</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-bold text-purple-300">
                        {role ? role.name : 'ไม่ทราบบทบาท'}
                      </span>
                      {team && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border ${team.badgeBg}`}>
                          {team.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {p.isAlive ? (
                    <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40">
                      รอดชีวิต
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-rose-400 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40">
                      เสียชีวิต
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Play Again Button */}
      {isHost ? (
        <button
          onClick={handleRestart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 active:scale-95 text-white font-extrabold text-base shadow-2xl shadow-purple-950/60 flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>เล่นรอบใหม่อีกครั้ง! (ห้องเดิม)</span>
        </button>
      ) : (
        <div className="text-center text-xs text-purple-300 animate-pulse">
          กำลังรอหัวหน้าห้องเปิดรอบใหม่... ทุกคนจะยังอยู่ในห้องเดิม
        </div>
      )}
    </div>
  );
}
