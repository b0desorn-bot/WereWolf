import React, { useState } from 'react';
import { X, Shield, Eye, Heart, Sparkles, User, Moon, Award, Crown, Skull, Zap, Smile, EyeOff, Sparkle, Copy, Crosshair } from 'lucide-react';
import { ROLES, TEAMS } from '../data/roles';

export function RoleInfoModal({ isOpen, onClose }) {
  const [selectedTeam, setSelectedTeam] = useState('all');

  if (!isOpen) return null;

  const roleList = Object.values(ROLES).filter(r => {
    if (selectedTeam === 'all') return true;
    return r.team === selectedTeam;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <h2 className="text-lg font-bold text-white">คู่มือบทบาท (Ultimate Werewolf Deluxe)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Filter Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedTeam('all')}
            className={`px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all ${
              selectedTeam === 'all'
                ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ทั้งหมด ({Object.keys(ROLES).length})
          </button>
          <button
            onClick={() => setSelectedTeam('villagers')}
            className={`px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all ${
              selectedTeam === 'villagers'
                ? 'bg-emerald-600/30 text-emerald-300 border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ฝ่ายชาวบ้าน 🧑‍🌾
          </button>
          <button
            onClick={() => setSelectedTeam('werewolves')}
            className={`px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all ${
              selectedTeam === 'werewolves'
                ? 'bg-red-600/30 text-red-300 border-b-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ฝ่ายมนุษย์หมาป่า 🐺
          </button>
          <button
            onClick={() => setSelectedTeam('neutral')}
            className={`px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all ${
              selectedTeam === 'neutral'
                ? 'bg-amber-600/30 text-amber-300 border-b-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ฝ่ายเป็นกลาง 🎭
          </button>
        </div>

        {/* Roles List */}
        <div className="p-4 overflow-y-auto space-y-3 divide-y divide-slate-800/60">
          {roleList.map((role) => {
            const teamInfo = TEAMS[role.team.toUpperCase()] || TEAMS.VILLAGERS;
            return (
              <div key={role.id} className="pt-3 first:pt-0 flex gap-3.5 items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  {role.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-white text-base">{role.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${teamInfo.badgeBg} font-medium`}>
                      {teamInfo.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      คะแนน: {role.weight > 0 ? `+${role.weight}` : role.weight}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {role.description}
                  </p>
                  <p className="text-[11px] text-purple-300/90 mt-1 italic">
                    💡 คำแนะนำ: {role.actionPrompt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center text-xs text-slate-400">
          Ultimate Werewolf Deluxe Edition • แปลภาษาไทยสมบูรณ์แบบ
        </div>
      </div>
    </div>
  );
}
