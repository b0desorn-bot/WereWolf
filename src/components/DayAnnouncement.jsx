import React from 'react';
import { Sun, Skull, HeartHandshake, ShieldAlert, Users, MessageSquare } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { sound } from '../utils/audio';

export function DayAnnouncement() {
  const { gameState, startDayDiscussion } = useGame();
  const isHost = gameState?.me?.isHost;
  const deaths = gameState?.deathsTonight || [];
  const dayNumber = gameState?.dayNumber || 1;

  const handleStartDiscussion = () => {
    sound.playClick();
    startDayDiscussion(180); // default 3 minutes discussion
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 min-h-[80vh] flex flex-col justify-center items-center text-center">
      {/* Sun Header */}
      <div className="space-y-2">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 flex items-center justify-center text-4xl shadow-xl shadow-amber-900/40 animate-bounce-subtle">
          ☀️
        </div>
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          รุ่งอรุณ วันที่ {dayNumber}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          แสงสว่างส่องมายังหมู่บ้าน
        </h2>
      </div>

      {/* Deaths Box */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-4">
        {deaths.length === 0 ? (
          <div className="py-6 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-3xl">
              🕊️
            </div>
            <h3 className="text-lg font-black text-emerald-400">
              ปาฏิหาริย์ยามเช้า!
            </h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              ในคืนที่ผ่านมา ไม่มีใครเสียชีวิตในหมู่บ้าน! ทุกคนตื่นขึ้นมาอย่างปลอดภัย
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
              <Skull className="w-4 h-4" />
              <span>ข่าวร้ายประจำวัน! มีผู้เสียชีวิต {deaths.length} คน</span>
            </div>

            <div className="space-y-2.5">
              {deaths.map((d, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-rose-800/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{d.avatar}</span>
                    <div className="text-left">
                      <p className="font-extrabold text-white text-sm">{d.name}</p>
                      <span className="text-[11px] text-rose-400">
                        บทบาท: {d.roleName}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/50 font-medium">
                    {d.cause === 'night' ? 'ถูกสังหารในความมืด' : d.cause === 'vote' ? 'ถูกประหารชีวิต' : 'ตรอมใจตาย'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {isHost ? (
          <button
            onClick={handleStartDiscussion}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-white font-extrabold text-base shadow-xl shadow-orange-950/50 flex items-center justify-center gap-2 transition-all mt-4"
          >
            <MessageSquare className="w-5 h-5" />
            <span>เริ่มการพูดคุยสืบสวน (3 นาที)</span>
          </button>
        ) : (
          <div className="pt-2 text-xs text-purple-300 animate-pulse">
            รอหัวหน้าห้องเริ่มช่วงพูดคุยสืบสวน...
          </div>
        )}
      </div>
    </div>
  );
}
