import React, { useState } from 'react';
import { Vote, Skull, Check, Award, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { sound } from '../utils/audio';

export function VotingView() {
  const { gameState, castVote, resolveVoting, nextNight } = useGame();
  const [voteSummary, setVoteSummary] = useState(null);
  const [resolving, setResolving] = useState(false);

  const me = gameState?.me;
  const isHost = me?.isHost;
  const livingPlayers = (gameState?.players || []).filter(p => p.isAlive);
  const isDead = !me?.isAlive;
  const isMayor = me?.role === 'mayor';
  const myVote = gameState?.votingData?.myVote;
  const totalVotesCast = gameState?.votingData?.votes || 0;

  const handleVote = (targetId) => {
    if (isDead) return;
    sound.playClick();
    castVote(targetId);
  };

  const handleResolve = async () => {
    sound.playClick();
    setResolving(true);
    const res = await resolveVoting();
    setResolving(false);
    if (res?.success) {
      setVoteSummary(res.summary);
      if (res.summary?.isTannerWin) {
        sound.playVictory();
      } else if (res.summary?.executedPlayer) {
        sound.playDeath();
      }
    }
  };

  const handleProceedToNight = () => {
    sound.playNight();
    nextNight();
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-20">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-700 via-rose-700 to-amber-600 flex items-center justify-center text-3xl shadow-xl shadow-rose-950/40">
          ⚖️
        </div>
        <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
          ช่วงพิพากษาคดี
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          ลงคะแนนโหวตประหารชีวิต
        </h2>
        <p className="text-xs text-slate-400">
          การโหวตเป็นความลับผ่านหน้าจอมือถือของคุณ
        </p>
      </div>

      {/* Mayor Badge Notification */}
      {isMayor && (
        <div className="p-3 rounded-2xl bg-yellow-950/50 border border-yellow-500/50 text-yellow-300 text-xs flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>คุณคือผู้ใหญ่บ้าน! เสียงโหวตของคุณจะมีน้ำหนักคูณ 2 เท่า</span>
        </div>
      )}

      {/* Dead Player Observer Notification */}
      {isDead && (
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
          <Skull className="w-4 h-4 text-slate-500 shrink-0" />
          <span>คุณเสียชีวิตแล้ว สามารถรับชมการโหวตได้แต่ไม่มีสิทธิ์ลงคะแนน</span>
        </div>
      )}

      {/* Main Ballot Grid (Before Resolution) */}
      {!voteSummary ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>แตะเลือกผู้ต้องสงสัย:</span>
            <span className="font-mono text-purple-400 font-bold">
              ลงคะแนนแล้ว {totalVotesCast} / {livingPlayers.length} คน
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto">
            {/* Skip Vote Option */}
            <button
              disabled={isDead}
              onClick={() => handleVote('skip')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 col-span-2 transition-all ${
                myVote === 'skip'
                  ? 'bg-purple-950/90 border-purple-500 shadow-md ring-1 ring-purple-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-2xl">⚪</span>
              <div className="flex-1">
                <p className="font-bold text-xs text-white">งดออกเสียง (ไม่ประหารใคร)</p>
                <span className="text-[10px] text-slate-400">
                  {myVote === 'skip' ? '✓ คุณเลือกงดออกเสียง' : 'แตะเพื่อเลือก'}
                </span>
              </div>
            </button>

            {/* Suspect Players */}
            {livingPlayers.map((p) => {
              const isSelected = myVote === p.id;
              const isSelf = p.id === me?.id;
              return (
                <button
                  key={p.id}
                  disabled={isDead}
                  onClick={() => handleVote(p.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-rose-950/90 border-rose-500 shadow-md ring-1 ring-rose-500 scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{p.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-white truncate">{p.name}</p>
                    <span className="text-[10px] text-rose-300">
                      {isSelected ? '✓ โหวตคนนี้' : isSelf ? '(โหวตตัวเอง)' : 'แตะเพื่อโหวต'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Host Tally Button */}
          {isHost ? (
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-base shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 transition-all mt-4"
            >
              <Vote className="w-5 h-5" />
              <span>เปิดหีบสรุปผลคะแนนโหวต</span>
            </button>
          ) : (
            <div className="text-center text-xs text-purple-300 animate-pulse pt-2">
              เมื่อทุกคนลงคะแนนเสร็จแล้ว หัวหน้าห้องจะเปิดหีบสรุปผล
            </div>
          )}
        </div>
      ) : (
        /* Summary of Tally & Execution */
        <div className="bg-slate-900/90 border border-slate-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-5 animate-fade-in text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl">
            {voteSummary.isTannerWin ? '🎭' : voteSummary.wasPrinceSaved ? '👑' : voteSummary.executedPlayer ? '⚖️' : '🕊️'}
          </div>

          <div className="space-y-1">
            <h3 className="font-black text-xl text-white">
              ผลคำพิพากษาของหมู่บ้าน
            </h3>
            <p className="text-xs text-purple-300 font-medium">
              {voteSummary.message}
            </p>
          </div>

          {/* Executed Player Reveal */}
          {voteSummary.executedPlayer && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-rose-700/60 inline-flex items-center gap-3">
              <span className="text-4xl">{voteSummary.executedPlayer.avatar}</span>
              <div className="text-left">
                <p className="font-extrabold text-white text-base">{voteSummary.executedPlayer.name}</p>
                <span className="text-xs text-rose-400 font-bold">
                  บทบาทที่แท้จริง: {voteSummary.executedPlayer.role}
                </span>
              </div>
            </div>
          )}

          {/* Host Next Night Button */}
          {isHost && gameState?.state !== 'GAME_OVER' && gameState?.state !== 'HUNTER_REVENGE' && (
            <button
              onClick={handleProceedToNight}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-700 to-slate-900 hover:from-indigo-500 hover:to-slate-800 active:scale-95 text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2 transition-all mt-4 border border-indigo-400/30"
            >
              <span>เข้าสู่ราตรีกาลถัดไป</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
