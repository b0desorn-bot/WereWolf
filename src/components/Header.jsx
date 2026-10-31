import React, { useState } from 'react';
import { Volume2, VolumeX, ScrollText, Copy, Check, Users, Moon, Sun, LogOut, RotateCcw, AlertCircle, Home } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { sound } from '../utils/audio';

export function Header({ onOpenLogs, onOpenRoleGuide }) {
  const { gameState, leaveRoom, restartGame } = useGame();
  const [copied, setCopied] = useState(false);
  const [soundOn, setSoundOn] = useState(sound.enabled);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  if (!gameState) return null;

  const isHost = gameState.me?.isHost;
  const isLobby = gameState.state === 'LOBBY';

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

  const handleConfirmExit = () => {
    setShowExitModal(false);
    leaveRoom();
  };

  const handleConfirmReset = () => {
    setShowResetModal(false);
    restartGame();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2.5 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Left: App Title & Room Code */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-rose-600 flex items-center justify-center text-lg shadow-md shrink-0">
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
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* If host and game is active mid-match, allow returning to lobby */}
            {isHost && !isLobby && (
              <button
                onClick={() => setShowResetModal(true)}
                className="px-2 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/40 text-amber-300 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                title="ยุติเกมและกลับสู่ล็อบบี้"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">กลับล็อบบี้</span>
              </button>
            )}

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
              <span className="hidden md:inline">คู่มือบทบาท</span>
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
                <span className="text-xs font-medium text-slate-200 hidden lg:inline max-w-[80px] truncate">
                  {gameState.me.name}
                </span>
              </div>
            )}

            {/* Leave Room Button */}
            <button
              onClick={() => setShowExitModal(true)}
              className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 border border-rose-600/50 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all ml-1 shadow-sm"
              title="ออกจากห้องนี้กลับไปหน้าแรก"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากห้อง</span>
            </button>
          </div>
        </div>
      </header>

      {/* Leave Room Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-3xl">
              🚪
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">ต้องการออกจากห้องหรือไม่?</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                คุณจะถูกนำกลับไปยังหน้าแรก และสามารถเข้าร่วมห้องใหม่หรือสร้างห้องใหม่ได้ทุกเมื่อ
              </p>
              {isHost && (
                <p className="text-[11px] text-amber-300 mt-2 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
                  ⚠️ คุณเป็นหัวหน้าห้อง หากคุณออก สิทธิ์หัวหน้าห้องจะถูกส่งต่อให้ผู้เล่นคนถัดไป
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmExit}
                className="py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-950/50 transition-all active:scale-95"
              >
                ออกจากห้อง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset to Lobby Confirmation Modal (For Host) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-3xl">
              🔄
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">กลับสู่ห้องล็อบบี้?</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                เกมในรอบปัจจุบันจะถูกยกเลิก และพาทุกคนในห้องกลับสู่ล็อบบี้เพื่อเตรียมตั้งค่าและเริ่มเล่นรอบใหม่
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                เล่นต่อ
              </button>
              <button
                onClick={handleConfirmReset}
                className="py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs shadow-md shadow-amber-950/50 transition-all active:scale-95"
              >
                กลับล็อบบี้
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
