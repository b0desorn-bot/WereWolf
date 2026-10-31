import React, { useState } from 'react';
import { Volume2, VolumeX, ScrollText, Copy, Check, Users, Moon, Sun } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { sound } from '../utils/audio';

export function Header({ onOpenLogs, onOpenRoleGuide }) {
  const { gameState } = useGame();
  const [copied, setCopied] = useState(false);
  const [soundOn, setSoundOn] = useState(sound.enabled);

  if (!gameState) return null;

  const copyRoomLink = () => {
    const url = `${window.location.origin}?room=${gameState.code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleSound = () => {
    const newState = sound.toggleSound();
    setSoundOn(newState);
  };

  const getPhaseName = () => {
    switch (gameState.state) {
      case 'LOBBY': return 'ห้องล็อบบี้';
      case 'ROLE_REVEAL': return 'แจกการ์ดบทบาท';
      case 'NIGHT': return `ค่ำคืนที่ ${gameState.nightNumber}`;
      case 'DAY_ANNOUNCEMENT': return `รุ่งอรุณ วันที่ ${gameState.dayNumber}`;
      case 'DAY_DISCUSSION': return `ช่วงพูดคุย วันที่ ${gameState.dayNumber}`;
      case 'VOTING': return 'ช่วงโหวตประหาร';
      case 'HUNTER_REVENGE': return 'นายพรานลั่นไก!';
      case 'GAME_OVER': return 'จบเกม';
      default: return '';
    }
  };

  const isNight = gameState.state === 'NIGHT';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: App Title & Room Code */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-rose-600 flex items-center justify-center text-lg shadow-md">
            🐺
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-white">หมาป่าดีลักซ์</span>
              <button
                onClick={copyRoomLink}
                title="คลิกเพื่อคัดลอกลิงก์ห้อง"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-950/70 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 active:scale-95 transition-all"
              >
                <span>{gameState.code}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-purple-400" />}
              </button>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              {isNight ? <Moon className="w-3 h-3 text-indigo-400 inline" /> : <Sun className="w-3 h-3 text-amber-400 inline" />}
              <span className="font-medium text-slate-300">{getPhaseName()}</span>
            </div>
          </div>
        </div>

        {/* Right: Controls & User Info */}
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 active:scale-95 transition-all"
            title={soundOn ? 'ปิดเสียง' : 'เปิดเสียง'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Role Guide */}
          <button
            onClick={onOpenRoleGuide}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-xs font-medium text-slate-300 flex items-center gap-1 active:scale-95 transition-all"
            title="คู่มือบทบาททั้งหมด"
          >
            <span>📜</span>
            <span className="hidden sm:inline">คู่มือบทบาท</span>
          </button>

          {/* Game Logs */}
          <button
            onClick={onOpenLogs}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 active:scale-95 transition-all relative"
            title="บันทึกเหตุการณ์"
          >
            <ScrollText className="w-4 h-4 text-purple-400" />
            {gameState.gameLogs && gameState.gameLogs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* Current Player Avatar */}
          {gameState.me && (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-700/60">
              <span className="text-xl" title={gameState.me.name}>{gameState.me.avatar}</span>
              <span className="text-xs font-medium text-slate-200 hidden md:inline max-w-[80px] truncate">
                {gameState.me.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
