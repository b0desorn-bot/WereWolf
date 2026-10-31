import React, { useState } from 'react';
import { useGame } from './context/SocketContext';
import { Header } from './components/Header';
import { JoinScreen } from './components/JoinScreen';
import { Lobby } from './components/Lobby';
import { RoleReveal } from './components/RoleReveal';
import { NightView } from './components/NightView';
import { DayAnnouncement } from './components/DayAnnouncement';
import { DayDiscussion } from './components/DayDiscussion';
import { VotingView } from './components/VotingView';
import { HunterRevengeModal } from './components/HunterRevengeModal';
import { GameOverView } from './components/GameOverView';
import { GameLogModal } from './components/GameLogModal';
import { RoleInfoModal } from './components/RoleInfoModal';

export function App() {
  const { gameState, connected, error } = useGame();
  const [showLogs, setShowLogs] = useState(false);
  const [showRoleGuide, setShowRoleGuide] = useState(false);

  // If not joined in a room yet, render the Join / Create screen
  if (!gameState || !gameState.code) {
    return <JoinScreen />;
  }

  const renderCurrentPhase = () => {
    switch (gameState.state) {
      case 'LOBBY':
        return <Lobby onOpenRoleGuide={() => setShowRoleGuide(true)} />;
      case 'ROLE_REVEAL':
        return <RoleReveal />;
      case 'NIGHT':
        return <NightView />;
      case 'DAY_ANNOUNCEMENT':
        return <DayAnnouncement />;
      case 'DAY_DISCUSSION':
        return <DayDiscussion />;
      case 'VOTING':
      case 'HUNTER_REVENGE':
        return <VotingView />;
      case 'GAME_OVER':
        return <GameOverView />;
      default:
        return <Lobby onOpenRoleGuide={() => setShowRoleGuide(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-thai selection:bg-purple-600 selection:text-white">
      {/* Universal Top Header */}
      <Header
        onOpenLogs={() => setShowLogs(true)}
        onOpenRoleGuide={() => setShowRoleGuide(true)}
      />

      {/* Main Game Screen */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2 sm:p-4">
        {renderCurrentPhase()}
      </main>

      {/* Global Modals */}
      <HunterRevengeModal />
      <GameLogModal isOpen={showLogs} onClose={() => setShowLogs(false)} />
      <RoleInfoModal isOpen={showRoleGuide} onClose={() => setShowRoleGuide(false)} />
    </div>
  );
}
export default App;
