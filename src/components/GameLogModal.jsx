import React from 'react';
import { X, ScrollText, Clock } from 'lucide-react';
import { useGame } from '../context/SocketContext';

export function GameLogModal({ isOpen, onClose }) {
  const { gameState } = useGame();

  if (!isOpen) return null;

  const logs = gameState?.gameLogs || [];

  const getLogStyle = (type) => {
    switch (type) {
      case 'danger':
        return 'text-rose-400 bg-rose-950/30 border-rose-800/40';
      case 'success':
        return 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40';
      case 'action':
        return 'text-purple-300 bg-purple-950/30 border-purple-800/40';
      case 'night':
        return 'text-indigo-300 bg-indigo-950/30 border-indigo-800/40';
      case 'winner':
        return 'text-amber-300 bg-amber-950/40 border-amber-500/50 font-bold';
      case 'highlight':
        return 'text-yellow-300 bg-yellow-950/30 border-yellow-800/40';
      default:
        return 'text-slate-300 bg-slate-800/40 border-slate-700/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">บันทึกเหตุการณ์ในเกม</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              ยังไม่มีบันทึกเหตุการณ์
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${getLogStyle(log.type)}`}
              >
                <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 font-mono mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{log.time}</span>
                </div>
                <div className="leading-relaxed flex-1">
                  {log.message}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center text-xs text-slate-400">
          บันทึกความคืบหน้าแบบ Real-time
        </div>
      </div>
    </div>
  );
}
