import React, { useState, useEffect } from 'react';
import { Moon, Eye, Shield, Sparkles, Heart, Crosshair, Users, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { ROLES, TEAMS } from '../data/roles';
import { sound } from '../utils/audio';

export function NightView() {
  const {
    gameState,
    nightActionCupid,
    nightActionDoppelganger,
    nightActionSeer,
    completeSeerStep,
    nightActionSorcerer,
    completeSorcererStep,
    voteWerewolf,
    confirmWerewolfKill,
    nightActionBodyguard,
    nightActionWitch,
    nextNight
  } = useGame();

  const me = gameState?.me;
  const isHost = me?.isHost;
  const currentStep = gameState?.nightStep;
  const livingPlayers = (gameState?.players || []).filter(p => p.isAlive);
  const activeRoleInfo = currentStep ? ROLES[currentStep] : null;

  // Local selection states
  const [selectedLover1, setSelectedLover1] = useState(null);
  const [selectedLover2, setSelectedLover2] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [seerScanResult, setSeerScanResult] = useState(null);
  const [witchUseHeal, setWitchUseHeal] = useState(false);
  const [witchPoisonTarget, setWitchPoisonTarget] = useState(null);
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset local states on step change
  useEffect(() => {
    setSelectedTarget(null);
    setSeerScanResult(null);
    setActionError('');
    setSubmitting(false);

    // Haptic vibration feedback on mobile when it's your turn
    if (isMyTurn && typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([150, 80, 150]);
    }
  }, [currentStep]);

  // Is it my turn right now?
  const isMyTurn = (() => {
    if (!me || !me.isAlive) return false;

    if (currentStep === 'werewolf') {
      return (
        me.role === 'werewolf' ||
        me.role === 'wolf_pup' ||
        me.role === 'lone_wolf' ||
        me.isTransformedToWolf
      );
    }
    return me.role === currentStep;
  })();

  // Werewolf teammates
  const isWolf = (
    me?.role === 'werewolf' ||
    me?.role === 'wolf_pup' ||
    me?.role === 'lone_wolf' ||
    me?.isTransformedToWolf
  );
  const wolfTeammates = livingPlayers.filter(p => p.role === 'werewolf' || p.role === 'wolf_pup');

  // --- ACTIONS ---

  const handleCupidSubmit = async () => {
    if (!selectedLover1 || !selectedLover2) {
      setActionError('กรุณาเลือกผู้เล่น 2 คน');
      return;
    }
    sound.playClick();
    setSubmitting(true);
    await nightActionCupid(selectedLover1, selectedLover2);
    setSubmitting(false);
  };

  const handleDoppelgangerSubmit = async () => {
    if (!selectedTarget) {
      setActionError('กรุณาเลือกเป้าหมาย 1 คน');
      return;
    }
    sound.playClick();
    setSubmitting(true);
    await nightActionDoppelganger(selectedTarget);
    setSubmitting(false);
  };

  const handleSeerScan = async () => {
    if (!selectedTarget) {
      setActionError('กรุณาเลือกผู้เล่นที่จะส่อง');
      return;
    }
    sound.playClick();
    setSubmitting(true);
    const res = await nightActionSeer(selectedTarget);
    setSubmitting(false);
    if (res?.success) {
      setSeerScanResult(res.result);
      sound.playReveal();
    }
  };

  const handleSeerDone = () => {
    sound.playClick();
    completeSeerStep();
  };

  const handleWolfVote = (targetId) => {
    sound.playClick();
    setSelectedTarget(targetId);
    voteWerewolf(targetId);
  };

  const handleWolfConfirm = () => {
    if (!selectedTarget) {
      setActionError('กรุณาเลือกเหยื่อที่จะสังหาร');
      return;
    }
    sound.playClick();
    confirmWerewolfKill(selectedTarget);
  };

  const handleBodyguardSubmit = async () => {
    if (!selectedTarget) {
      setActionError('กรุณาเลือกผู้เล่นที่จะคุ้มกัน');
      return;
    }
    sound.playClick();
    setSubmitting(true);
    const res = await nightActionBodyguard(selectedTarget);
    setSubmitting(false);
    if (!res?.success) {
      setActionError(res?.message || 'ไม่สามารถเลือกคนนี้ได้');
    }
  };

  const handleWitchSubmit = async () => {
    sound.playClick();
    setSubmitting(true);
    await nightActionWitch(witchUseHeal, witchPoisonTarget);
    setSubmitting(false);
  };

  // Find werewolf victim for witch
  const wolfVictimId = gameState?.nightData?.witchVictim;
  const wolfVictim = livingPlayers.find(p => p.id === wolfVictimId);

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-[85vh] flex flex-col justify-between pb-24">
      {/* Top Night Progress */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-xs font-bold text-indigo-300 mb-2">
          <Moon className="w-3.5 h-3.5 text-amber-300" />
          <span>ค่ำคืนที่ {gameState?.nightNumber}</span>
          <span className="text-slate-500">•</span>
          <span>ขั้นตอนที่ {(gameState?.nightStepIndex || 0) + 1} จาก {gameState?.totalNightSteps || 1}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          {isMyTurn ? '🌟 ถึงตาของคุณแล้ว!' : 'ราตรีอันมืดมิด...'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {isMyTurn
            ? activeRoleInfo?.actionPrompt
            : `หมู่บ้านกำลังหลับใหล... กำลังเรียก ${activeRoleInfo?.name || 'บทบาทถัดไป'}`}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* CASE A: SLEEPING (Not my turn) */}
        {!isMyTurn && (
          <div className="text-center py-10 px-6 max-w-sm rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-2xl space-y-4 animate-pulse-slow">
            <div className="w-24 h-24 mx-auto rounded-full bg-indigo-950/80 border-2 border-indigo-500/30 flex items-center justify-center text-5xl shadow-xl">
              😴
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                หลับตาให้สนิท
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                ตอนนี้ไม่ใช่ตาของคุณ กรุณารออย่างเงียบสงบ เมื่อถึงตาคุณ หน้าจอจะสว่างและสั่นเตือนอัตโนมัติ
              </p>
            </div>
            <div className="pt-2 text-[11px] text-indigo-300/80">
              กำลังรอ: <span className="font-bold text-amber-300">{activeRoleInfo?.name}</span> ปฏิบัติการ
            </div>
          </div>
        )}

        {/* CASE B: ACTIVE ROLE TURN */}
        {isMyTurn && (
          <div className="w-full bg-slate-900/90 border border-purple-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-5">
            {/* Header of Active Role */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{activeRoleInfo?.emoji}</span>
                <div>
                  <h3 className="font-black text-lg text-white">
                    {activeRoleInfo?.name}
                  </h3>
                  <span className="text-xs text-purple-300">
                    ปฏิบัติการยามค่ำคืน
                  </span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 font-mono">
                {me?.name}
              </span>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* 1. CUPID SCREEN */}
            {currentStep === 'cupid' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  เลือกผู้เล่น 2 คน เพื่อผูกชะตาเป็นคู่รัก:
                </p>
                <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto">
                  {livingPlayers.map((p) => {
                    const is1 = selectedLover1 === p.id;
                    const is2 = selectedLover2 === p.id;
                    const selected = is1 || is2;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          sound.playClick();
                          if (is1) setSelectedLover1(null);
                          else if (is2) setSelectedLover2(null);
                          else if (!selectedLover1) setSelectedLover1(p.id);
                          else if (!selectedLover2) setSelectedLover2(p.id);
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                          selected
                            ? 'bg-pink-950/80 border-pink-500 shadow-md scale-[1.02]'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl">{p.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-white truncate">{p.name}</p>
                          <span className="text-[10px] text-pink-300">
                            {is1 ? '❤️ คู่รักคนที่ 1' : is2 ? '❤️ คู่รักคนที่ 2' : 'แตะเพื่อเลือก'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleCupidSubmit}
                  disabled={!selectedLover1 || !selectedLover2 || submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-950/50 disabled:opacity-30 active:scale-95 transition-all"
                >
                  ยืนยันคู่รักชะตากรรม
                </button>
              </div>
            )}

            {/* 2. DOPPELGANGER SCREEN */}
            {currentStep === 'doppelganger' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  เลือกผู้เล่น 1 คนที่คุณต้องการลอกแบบวิญญาณ:
                </p>
                <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto">
                  {livingPlayers.filter(p => p.id !== me?.id).map((p) => {
                    const isSelected = selectedTarget === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => { sound.playClick(); setSelectedTarget(p.id); }}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-teal-950/80 border-teal-500 shadow-md scale-[1.02]'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <span className="text-2xl">{p.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-white truncate">{p.name}</p>
                          <span className="text-[10px] text-teal-300">
                            {isSelected ? '✓ เป้าหมาย' : 'แตะเพื่อเลือก'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleDoppelgangerSubmit}
                  disabled={!selectedTarget || submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-sm shadow-lg disabled:opacity-30 active:scale-95 transition-all"
                >
                  ยืนยันเป้าหมายผูกวิญญาณ
                </button>
              </div>
            )}

            {/* 3. SEER SCREEN */}
            {currentStep === 'seer' && (
              <div className="space-y-4">
                {!seerScanResult ? (
                  <>
                    <p className="text-xs text-slate-300">
                      เลือกผู้เล่น 1 คนที่คุณต้องการส่องดูตัวตนที่แท้จริง:
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto">
                      {livingPlayers.filter(p => p.id !== me?.id).map((p) => {
                        const isSelected = selectedTarget === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => { sound.playClick(); setSelectedTarget(p.id); }}
                            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                              isSelected
                                ? 'bg-purple-950/80 border-purple-500 shadow-md scale-[1.02]'
                                : 'bg-slate-950/60 border-slate-800'
                            }`}
                          >
                            <span className="text-2xl">{p.avatar}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs text-white truncate">{p.name}</p>
                              <span className="text-[10px] text-purple-300">
                                {isSelected ? '🔮 ส่องคนนี้' : 'แตะเพื่อเลือก'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={handleSeerScan}
                      disabled={!selectedTarget || submitting}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-950/50 disabled:opacity-30 active:scale-95 transition-all"
                    >
                      ส่องดูตัวตนของผู้เล่นคนนี้
                    </button>
                  </>
                ) : (
                  /* Revealed Seer Scan Result Modal */
                  <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/60 text-center space-y-4 animate-fade-in">
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-950/80 border border-purple-400 flex items-center justify-center text-4xl shadow-xl">
                      {seerScanResult.targetAvatar}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {seerScanResult.targetName}
                      </h4>
                      <div className={`mt-2 py-2 px-4 rounded-xl font-black text-base border inline-block ${
                        seerScanResult.isWerewolf
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      }`}>
                        {seerScanResult.resultText}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      จดจำข้อมูลนี้ไว้ เพื่อช่วยชาวบ้านสืบหาหมาป่าในตอนกลางวัน!
                    </p>
                    <button
                      onClick={handleSeerDone}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
                    >
                      รับทราบข้อมูลเรียบร้อย (เสร็จสิ้น)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. WEREWOLVES SCREEN */}
            {currentStep === 'werewolf' && (
              <div className="space-y-4">
                {/* Fellow Werewolves Header */}
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-600/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 mb-1">
                    <span>🐺 ฝูงหมาป่าของคุณ:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wolfTeammates.map(w => (
                      <span key={w.id} className="text-xs px-2.5 py-1 rounded-xl bg-slate-900 border border-rose-500/40 text-slate-200 flex items-center gap-1">
                        <span>{w.avatar}</span>
                        <span className="font-bold">{w.name}</span>
                        {w.id === me?.id && <span className="text-[10px] text-rose-400">(คุณ)</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  แตะเลือกเหยื่อที่ต้องการสังหารในคืนนี้:
                </p>

                {/* Target Selection Grid */}
                <div className="grid grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto">
                  {livingPlayers.filter(p => !wolfTeammates.some(w => w.id === p.id)).map((p) => {
                    const isSelected = selectedTarget === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleWolfVote(p.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-rose-950/80 border-rose-600 shadow-md scale-[1.02]'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <span className="text-2xl">{p.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-white truncate">{p.name}</p>
                          <span className="text-[10px] text-rose-400">
                            {isSelected ? '🎯 เหยื่อที่เลือก' : 'แตะเพื่อเลือก'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleWolfConfirm}
                  disabled={!selectedTarget}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 text-white font-extrabold text-sm shadow-xl shadow-red-950/60 disabled:opacity-30 active:scale-95 transition-all"
                >
                  ยืนยันการสังหารเหยื่อ
                </button>
              </div>
            )}

            {/* 5. BODYGUARD SCREEN */}
            {currentStep === 'bodyguard' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  เลือกผู้เล่น 1 คนที่คุณต้องการปกป้องจากการโจมตีของหมาป่า:
                </p>
                <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto">
                  {livingPlayers.map((p) => {
                    const isLastProtected = gameState?.nightData?.lastProtectedId === p.id;
                    const isSelected = selectedTarget === p.id;
                    return (
                      <button
                        key={p.id}
                        disabled={isLastProtected}
                        onClick={() => { sound.playClick(); setSelectedTarget(p.id); }}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-cyan-950/80 border-cyan-500 shadow-md scale-[1.02]'
                            : isLastProtected
                            ? 'bg-slate-950/30 border-slate-800/40 opacity-40 cursor-not-allowed'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <span className="text-2xl">{p.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-white truncate">{p.name}</p>
                          <span className="text-[10px] text-cyan-300">
                            {isLastProtected
                              ? '🚫 ห้ามคุ้มกันซ้ำ'
                              : isSelected
                              ? '🛡️ คุ้มกันคนนี้'
                              : 'แตะเพื่อเลือก'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleBodyguardSubmit}
                  disabled={!selectedTarget || submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-950/50 disabled:opacity-30 active:scale-95 transition-all"
                >
                  ยืนยันการคุ้มกัน
                </button>
              </div>
            )}

            {/* 6. WITCH SCREEN */}
            {currentStep === 'witch' && (
              <div className="space-y-4">
                {/* Heal Potion Option */}
                {me?.witchHealLeft && wolfVictim && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🧪</span>
                        <span className="font-bold text-xs text-emerald-300">ยาชุบชีวิต (เหลือ 1 ครั้ง)</span>
                      </div>
                      <button
                        onClick={() => { sound.playClick(); setWitchUseHeal(!witchUseHeal); }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                          witchUseHeal
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {witchUseHeal ? '✓ ใช้ช่วยชีวิต' : 'ไม่ใช้'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-300">
                      หมาป่ากำลังจะฆ่า: <span className="font-bold text-rose-400">{wolfVictim.avatar} {wolfVictim.name}</span>
                    </p>
                  </div>
                )}

                {/* Poison Potion Option */}
                {me?.witchPoisonLeft && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-fuchsia-500/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">☠️</span>
                      <span className="font-bold text-xs text-fuchsia-300">ยาพิษ (เหลือ 1 ครั้ง)</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      แตะเลือกผู้เล่น 1 คนเพื่อปลิดชีพ หรือไม่เลือกใครเลย:
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto">
                      {livingPlayers.filter(p => p.id !== me?.id).map((p) => {
                        const isSelected = witchPoisonTarget === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              sound.playClick();
                              setWitchPoisonTarget(isSelected ? null : p.id);
                            }}
                            className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                              isSelected
                                ? 'bg-fuchsia-950/80 border-fuchsia-500 shadow-md'
                                : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            <span className="text-lg">{p.avatar}</span>
                            <span className="font-bold text-xs text-white truncate">{p.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleWitchSubmit}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-fuchsia-950/50 active:scale-95 transition-all"
                >
                  เสร็จสิ้นการตัดสินใจของแม่มด
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Host Skip / Companion Bar */}
      {isHost && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto p-3 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            👑 หัวหน้าห้อง: หากคนนั้นรอนาน สามารถกดข้ามได้
          </div>
          <button
            onClick={() => { sound.playClick(); nextNight(); }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all shrink-0"
          >
            <span>ข้ามขั้นตอนนี้</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
