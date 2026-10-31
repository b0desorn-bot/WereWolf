import React, { useState, useEffect } from 'react';
import { Clock, Vote, Users, Plus, Minus, Pause, Play, ShieldAlert, Award, Skull } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { sound } from '../utils/audio';

export function DayDiscussion() {
  const { gameState, startVoting } = useGame();
  const [timeLeft, setTimeLeft] = useState(180);
  const [isPaused, setIsPaused] = useState(false);

  const isHost = gameState?.me?.isHost;
  const players = gameState?.players || [];
  const livingPlayers = players.filter(p => p.isAlive);
  const deadPlayers = players.filter(p => !p.isAlive);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartVoting = () => {
    sound.playClick();
    startVoting(60); // 60 seconds voting timer
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-20">
      {/* Timer Display */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-3">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          ช่วงปรึกษาหารือและสืบหาหมาป่า
        </span>

        <div className="font-mono text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 tracking-wider">
          {formatTime(timeLeft)}
        </div>

        {/* Host Timer Controls */}
        {isHost && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setTimeLeft(prev => Math.max(0, prev - 30))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold active:scale-95 transition-all"
              title="ลด 30 วินาที"
            >
              -30s
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'เริ่มต่อ' : 'พักเวลา'}</span>
            </button>
            <button
              onClick={() => setTimeLeft(prev => prev + 30)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold active:scale-95 transition-all"
              title="เพิ่ม 30 วินาที"
            >
              +30s
            </button>
          </div>
        )}
      </div>

      {/* Players List during Day */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-bold text-white text-sm">ผู้เล่นที่มีชีวิต ({livingPlayers.length} คน)</span>
          <span>สังเกตคำพูดและพฤติกรรม!</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto">
          {livingPlayers.map((p) => {
            const isMe = p.id === gameState?.me?.id;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                  isMe
                    ? 'bg-purple-950/40 border-purple-500/50'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <span className="text-2xl">{p.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-xs text-white truncate">{p.name}</p>
                    {isMe && <span className="text-[10px] text-purple-400 font-semibold">(คุณ)</span>}
                  </div>
                  {p.isLover && (
                    <span className="text-[10px] text-pink-400 font-medium">❤️ คู่รักของคุณ</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Deceased Players */}
        {deadPlayers.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">
              ผู้เสียชีวิตแล้ว ({deadPlayers.length} คน)
            </span>
            <div className="flex flex-wrap gap-1.5 opacity-50">
              {deadPlayers.map((p) => (
                <span key={p.id} className="text-xs px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-1 line-through">
                  <span>{p.avatar}</span>
                  <span>{p.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Proceed to Voting Button */}
      {isHost ? (
        <button
          onClick={handleStartVoting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 active:scale-95 text-white font-extrabold text-base shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 transition-all"
        >
          <Vote className="w-5 h-5" />
          <span>เข้าสู่ช่วงโหวตประหารชีวิต</span>
        </button>
      ) : (
        <div className="text-center text-xs text-purple-300 animate-pulse">
          ปรึกษากันให้เต็มที่ เมื่อพร้อมแล้วหัวหน้าห้องจะเปิดหีบโหวต
        </div>
      )}
    </div>
  );
}
