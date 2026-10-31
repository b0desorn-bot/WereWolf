import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { sound } from '../utils/audio';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const lastStateRef = useRef(null);

  useEffect(() => {
    // Connect to same host & port (works seamlessly whether accessed via localhost, local IP, or public URL)
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      setConnected(false);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เกมได้');
    });

    // Handle real-time state updates
    socketInstance.on('room_state_update', (newState) => {
      // Audio cues based on state transition
      if (lastStateRef.current) {
        const oldState = lastStateRef.current.state;
        const curState = newState.state;

        if (oldState !== curState) {
          if (curState === 'NIGHT') {
            sound.playNight();
          } else if (curState === 'DAY_ANNOUNCEMENT' || curState === 'DAY_DISCUSSION') {
            sound.playMorning();
          } else if (curState === 'VOTING') {
            sound.playClick();
          } else if (curState === 'GAME_OVER') {
            sound.playVictory();
          }
        }

        // Night step change sound
        if (curState === 'NIGHT' && lastStateRef.current.nightStep !== newState.nightStep) {
          sound.playReveal();
        }
      }

      lastStateRef.current = newState;
      setGameState(newState);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createRoom = (hostName) => {
    return new Promise((resolve) => {
      if (!socket) return resolve({ success: false, message: 'ไม่ได้เชื่อมต่อ' });
      socket.emit('create_room', { hostName }, (res) => {
        resolve(res);
      });
    });
  };

  const joinRoom = (roomCode, playerName) => {
    return new Promise((resolve) => {
      if (!socket) return resolve({ success: false, message: 'ไม่ได้เชื่อมต่อ' });
      socket.emit('join_room', { roomCode, playerName }, (res) => {
        resolve(res);
      });
    });
  };

  const updateDeck = (deck) => {
    if (socket) socket.emit('update_deck', { deck });
  };

  const startGame = () => {
    return new Promise((resolve) => {
      if (!socket) return resolve({ success: false });
      socket.emit('start_game', (res) => resolve(res));
    });
  };

  const confirmRoleSeen = () => {
    if (socket) socket.emit('confirm_role_seen');
  };

  const beginFirstNight = () => {
    if (socket) socket.emit('begin_first_night');
  };

  // Night Actions
  const nightActionCupid = (lover1, lover2) => {
    return new Promise((resolve) => {
      if (socket) socket.emit('night_action_cupid', { lover1, lover2 }, resolve);
    });
  };

  const nightActionDoppelganger = (targetId) => {
    return new Promise((resolve) => {
      if (socket) socket.emit('night_action_doppelganger', { targetId }, resolve);
    });
  };

  const nightActionSeer = (targetId) => {
    return new Promise((resolve) => {
      if (socket) socket.emit('night_action_seer', { targetId }, resolve);
    });
  };

  const completeSeerStep = () => {
    if (socket) socket.emit('seer_complete');
  };

  const nightActionSorcerer = (targetId) => {
    return new Promise((resolve) => {
      if (socket) socket.emit('night_action_sorcerer', { targetId }, resolve);
    });
  };

  const completeSorcererStep = () => {
    if (socket) socket.emit('sorcerer_complete');
  };

  const voteWerewolf = (targetId) => {
    if (socket) socket.emit('night_vote_werewolf', { targetId });
  };

  const confirmWerewolfKill = (targetId) => {
    if (socket) socket.emit('confirm_werewolf_kill', { targetId });
  };

  const nightActionBodyguard = (targetId) => {
    return new Promise((resolve) => {
      if (socket) socket.emit('night_action_bodyguard', { targetId }, resolve);
    });
  };

  const nightActionWitch = (useHeal, poisonTargetId) => {
    return new Promise((resolve) => {
      if (socket) socket.emit('night_action_witch', { useHeal, poisonTargetId }, resolve);
    });
  };

  // Day Actions
  const startDayDiscussion = (timer) => {
    if (socket) socket.emit('start_day_discussion', { timer });
  };

  const startVoting = (timer) => {
    if (socket) socket.emit('start_voting', { timer });
  };

  const castVote = (targetId) => {
    sound.playClick();
    if (socket) socket.emit('cast_vote', { targetId });
  };

  const resolveVoting = () => {
    return new Promise((resolve) => {
      if (socket) socket.emit('resolve_voting', resolve);
    });
  };

  const shootHunter = (targetId) => {
    return new Promise((resolve) => {
      if (socket) socket.emit('hunter_shoot', { targetId }, resolve);
    });
  };

  const nextNight = () => {
    if (socket) socket.emit('next_night');
  };

  const restartGame = () => {
    if (socket) socket.emit('restart_game');
  };

  const leaveRoom = () => {
    sound.playClick();
    if (socket) {
      socket.emit('leave_room');
    }
    setGameState(null);
    // Clear ?room query parameter so it returns cleanly to join/create home screen
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        gameState,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        updateDeck,
        startGame,
        confirmRoleSeen,
        beginFirstNight,
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
        startDayDiscussion,
        startVoting,
        castVote,
        resolveVoting,
        shootHunter,
        nextNight,
        restartGame
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useGame() {
  return useContext(SocketContext);
}
