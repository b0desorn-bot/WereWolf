import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, ArrowRight, Sparkles, AlertCircle, Smartphone } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { sound } from '../utils/audio';

const AVATARS = ['🦊', '🐻', '🦉', '🐱', '🐶', '🦁', '🐯', '🐰', '🐼', '🐨', '🐸', '🐵', '🦄', '🐲', '🐺', '🦝'];

export function JoinScreen() {
  const { createRoom, joinRoom, error: socketError } = useGame();
  
  const [tab, setTab] = useState('join'); // 'join' | 'create'
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill room code from URL query parameter (e.g. ?room=WOLF)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('room');
    if (codeFromUrl) {
      setRoomCode(codeFromUrl.toUpperCase());
      setTab('join');
    }
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMessage('กรุณากรอกชื่อของคุณ');
      return;
    }
    if (!roomCode.trim()) {
      setErrorMessage('กรุณากรอกรหัสห้อง');
      return;
    }

    sound.playClick();
    setLoading(true);
    setErrorMessage('');

    const res = await joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'ไม่สามารถเข้าร่วมห้องได้');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMessage('กรุณากรอกชื่อของคุณ');
      return;
    }

    sound.playClick();
    setLoading(true);
    setErrorMessage('');

    const res = await createRoom(playerName.trim());
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'ไม่สามารถสร้างห้องได้');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="w-full max-w-md">
        {/* App Title & Wolf Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-rose-600 shadow-xl shadow-purple-900/40 mb-3 border border-purple-400/30 transform hover:scale-105 transition-transform">
            <span className="text-4xl">🐺</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 tracking-tight">
            ล่าปริศนามนุษย์หมาป่า
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80 mt-1 font-medium">
            Ultimate Werewolf Deluxe Edition • ภาษาไทย
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-[11px] text-indigo-300">
            <Smartphone className="w-3.5 h-3.5" />
            <span>เหมาะสำหรับเล่นผ่าน iPhone, Android & iPad</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 backdrop-blur-md">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl mb-6 border border-slate-800/80">
            <button
              onClick={() => { setTab('join'); setErrorMessage(''); }}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                tab === 'join'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>เข้าห้องเล่น</span>
            </button>
            <button
              onClick={() => { setTab('create'); setErrorMessage(''); }}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                tab === 'create'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>สร้างห้องใหม่</span>
            </button>
          </div>

          {/* Error Alert */}
          {(errorMessage || socketError) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage || socketError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={tab === 'join' ? handleJoin : handleCreate} className="space-y-4">
            {/* Player Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ชื่อของคุณ (Player Name)
              </label>
              <input
                type="text"
                placeholder="เช่น แม่, พ่อ, บอส, แจน..."
                maxLength={20}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                required
              />
            </div>

            {/* Room Code (Join Tab only) */}
            {tab === 'join' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  รหัสห้อง (Room Code 4 หลัก)
                </label>
                <input
                  type="text"
                  placeholder="เช่น WOLF"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-center font-mono font-bold tracking-widest text-lg uppercase focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{tab === 'join' ? 'เข้าร่วมวงหมาป่า' : 'เปิดห้องใหม่'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick tips */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            {tab === 'join'
              ? '💡 แสกน QR Code จากหน้าจอหัวหน้าห้องเพื่อเข้าห้องอัตโนมัติ'
              : '💡 เมื่อสร้างห้องแล้ว สามารถแชร์ QR Code ให้ครอบครัวสแกนได้ทันที'}
          </div>
        </div>
      </div>
    </div>
  );
}
