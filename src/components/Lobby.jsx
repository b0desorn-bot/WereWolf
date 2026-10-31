import React, { useState, useEffect } from 'react';
import { Users, QrCode, Play, Plus, Minus, Wand2, Shield, Info, CheckCircle2, AlertTriangle, Crown, LogOut } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { ROLES, TEAMS, getRecommendedDeck } from '../data/roles';
import { sound } from '../utils/audio';

export function Lobby({ onOpenRoleGuide }) {
  const { gameState, updateDeck, startGame, leaveRoom } = useGame();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [startError, setStartError] = useState('');

  const isHost = gameState?.me?.isHost;
  const players = gameState?.players || [];
  const deck = gameState?.deck || [];
  const playerCount = players.length;
  const deckCount = deck.length;
  const isMatch = playerCount === deckCount;

  // Fetch QR Code for this room
  useEffect(() => {
    if (gameState?.code) {
      const roomUrl = `${window.location.origin}?room=${gameState.code}`;
      fetch(`/api/qr?url=${encodeURIComponent(roomUrl)}`)
        .then(res => res.json())
        .then(data => {
          if (data.dataUrl) setQrDataUrl(data.dataUrl);
        })
        .catch(err => console.error('QR fetch error', err));
    }
  }, [gameState?.code]);

  // Deck count grouped: { roleId: count }
  const deckCounts = deck.reduce((acc, roleId) => {
    acc[roleId] = (acc[roleId] || 0) + 1;
    return acc;
  }, {});

  const handleAddRole = (roleId) => {
    sound.playClick();
    updateDeck([...deck, roleId]);
  };

  const handleRemoveRole = (roleId) => {
    sound.playClick();
    const index = deck.indexOf(roleId);
    if (index > -1) {
      const newDeck = [...deck];
      newDeck.splice(index, 1);
      updateDeck(newDeck);
    }
  };

  const handleAutoBalance = () => {
    sound.playClick();
    const recommended = getRecommendedDeck(playerCount >= 4 ? playerCount : 6);
    updateDeck(recommended);
  };

  const handleStart = async () => {
    sound.playClick();
    setStartError('');
    if (playerCount < 4) {
      setStartError('ต้องมีผู้เล่นอย่างน้อย 4 คนขึ้นไป');
      return;
    }
    if (!isMatch) {
      setStartError(`จำนวนการ์ด (${deckCount} ใบ) ไม่ตรงกับจำนวนผู้เล่น (${playerCount} คน)`);
      return;
    }

    const res = await startGame();
    if (!res.success) {
      setStartError(res.message || 'ไม่สามารถเริ่มเกมได้');
    }
  };

  // Balance rating indicator
  const balance = gameState?.balanceScore || 0;
  let balanceText = 'สมดุลมาก';
  let balanceColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';

  if (balance < -3) {
    balanceText = 'ฝ่ายหมาป่าได้เปรียบ';
    balanceColor = 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  } else if (balance > 3) {
    balanceText = 'ฝ่ายชาวบ้านได้เปรียบ';
    balanceColor = 'text-blue-400 border-blue-500/40 bg-blue-950/40';
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
      {/* Top Banner: Room Code & QR Button */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-widest">
            รหัสห้องสำหรับคนในครอบครัว
          </span>
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
            <span className="font-mono text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300 tracking-wider">
              {gameState?.code}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            เปิด Safari / Chrome เข้าเล่น หรือสแกน QR Code เพื่อเข้าร่วม
          </p>
        </div>

        {/* Actions: QR Code & Leave Room */}
        <div className="flex flex-wrap items-center gap-2.5">
          {qrDataUrl && (
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span>แสดง QR Code ให้สแกน</span>
            </button>
          )}
          <button
            onClick={() => leaveRoom()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-600/50 text-rose-300 hover:text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
            title="ออกจากห้องกลับไปหน้าแรก"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>ออกจากห้อง</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Players, Right = Role Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Player List */}
        <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="font-bold text-white text-base">ผู้เล่นในห้อง</h2>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
              playerCount >= 4 ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' : 'bg-amber-950 text-amber-400 border-amber-500/40'
            }`}>
              {playerCount} คน {playerCount < 4 ? '(ต้องการอย่างน้อย 4 คน)' : ''}
            </span>
          </div>

          {/* Players Grid */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {players.map((p) => {
              const isMe = p.id === gameState?.me?.id;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isMe
                      ? 'bg-purple-950/40 border-purple-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.avatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{p.name}</span>
                        {isMe && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-600/50 text-purple-200">
                            (คุณ)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {p.isHost ? '👑 หัวหน้าห้อง' : 'ผู้เล่น'}
                      </span>
                    </div>
                  </div>
                  {p.isHost && (
                    <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick status message */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
            {isHost ? (
              <p className="text-xs text-slate-400">
                เมื่อผู้เล่นครบและจัดสำรับการ์ดเสร็จแล้ว กดปุ่ม "เริ่มเกม" ด้านล่าง
              </p>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs text-purple-300 animate-pulse py-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>รอหัวหน้าห้องเริ่มเกม...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Role Deck Selection */}
        <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col">
          {/* Deck Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h2 className="font-bold text-white text-base">สำรับการ์ดบทบาท</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                เลือกบทบาทให้เท่ากับจำนวนผู้เล่น ({playerCount} คน)
              </p>
            </div>

            {/* Match Indicator */}
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center gap-1 ${
                isMatch ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' : 'bg-rose-950 text-rose-400 border-rose-500/40'
              }`}>
                {isMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>การ์ด {deckCount} / {playerCount} คน</span>
              </span>
            </div>
          </div>

          {/* Balance Indicator & Auto Balance Button */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800 mb-4 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">ความสมดุล:</span>
              <span className={`px-2 py-0.5 rounded-full font-bold border ${balanceColor}`}>
                {balanceText} ({balance > 0 ? `+${balance}` : balance})
              </span>
            </div>

            {isHost && (
              <button
                onClick={handleAutoBalance}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>จัดสำรับอัตโนมัติ</span>
              </button>
            )}
          </div>

          {/* Roles Selector List */}
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[360px] pr-1">
            {Object.values(ROLES).map((role) => {
              const countInDeck = deckCounts[role.id] || 0;
              const team = TEAMS[role.team.toUpperCase()];
              return (
                <div
                  key={role.id}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    countInDeck > 0
                      ? 'bg-slate-800/80 border-slate-600/80'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{role.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-white">{role.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border ${team.badgeBg}`}>
                          {team.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-[260px]">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  {/* Quantity controls (Host only) or count display */}
                  {isHost ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRemoveRole(role.id)}
                        disabled={countInDeck === 0}
                        className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-20 active:scale-90 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-bold text-sm text-purple-300 font-mono">
                        {countInDeck}
                      </span>
                      <button
                        onClick={() => handleAddRole(role.id)}
                        className="w-7 h-7 rounded-lg bg-purple-600/80 hover:bg-purple-500 border border-purple-400/40 flex items-center justify-center text-white active:scale-90 transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="px-2 py-1 rounded-lg bg-slate-800 text-xs font-mono font-bold text-purple-300 shrink-0">
                      x{countInDeck}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Guide link */}
          <div className="mt-3 text-center">
            <button
              onClick={onOpenRoleGuide}
              className="text-xs text-purple-400 hover:text-purple-300 hover:underline inline-flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>อ่านวิธีเล่นและพลังของทุกบทบาทอย่างละเอียด</span>
            </button>
          </div>
        </div>
      </div>

      {/* Start Button Area (Host only) */}
      {isHost && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-white text-base">พร้อมเริ่มเกมแล้วหรือยัง?</h3>
            <p className="text-xs text-slate-400">
              เมื่อเริ่มเกม ระบบจะสับการ์ดและแจกบทบาทแบบลับเฉพาะบุคคลไปยังโทรศัพท์ของทุกคน
            </p>
            {startError && (
              <p className="text-xs text-rose-400 font-medium mt-1">
                ⚠️ {startError}
              </p>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={!isMatch || playerCount < 4}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-base shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2.5 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>เริ่มเล่นเกมทันที!</span>
          </button>
        </div>
      )}

      {/* Fullscreen QR Code Modal for easy family scan on Living Room TV / iPad */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="font-bold text-lg text-white mb-1">สแกนเพื่อเข้าร่วมห้อง</h3>
            <p className="text-xs text-slate-400 mb-4">
              ใช้กล้อง iPhone / Android สแกน QR Code นี้เพื่อเข้าห้องทันที
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-4">
              <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto" />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xl font-black text-purple-300 tracking-widest mb-4">
              {gameState?.code}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
            >
              ปิดหน้าต่างนี้
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
