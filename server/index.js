import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import QRCode from 'qrcode';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameManager } from './gameManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const gameManager = new GameManager();

// Helper to get local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIpAddress();
const PORT = process.env.PORT || 3000;

// QR Code API endpoint
app.get('/api/qr', async (req, res) => {
  try {
    const targetUrl = req.query.url || `http://${localIp}:${PORT}`;
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      margin: 2,
      width: 320,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    res.json({ dataUrl: qrDataUrl, url: targetUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Broadcast room state to all players individually (each sees their own private view)
function broadcastRoomState(room) {
  if (!room) return;
  for (const player of room.players.values()) {
    const clientState = room.getClientState(player.id);
    io.to(player.id).emit('room_state_update', clientState);
  }
}

// Socket.io event handling
io.on('connection', (socket) => {
  // 1. Create Room
  socket.on('create_room', ({ hostName }, callback) => {
    try {
      const room = gameManager.createRoom(socket.id, hostName);
      socket.join(room.code);
      if (typeof callback === 'function') {
        callback({ success: true, roomCode: room.code });
      }
      broadcastRoomState(room);
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 2. Join Room
  socket.on('join_room', ({ roomCode, playerName }, callback) => {
    try {
      const cleanCode = (roomCode || '').trim().toUpperCase();
      const room = gameManager.getRoom(cleanCode);
      if (!room) {
        if (typeof callback === 'function') {
          callback({ success: false, message: `ไม่พบห้องรหัส "${cleanCode}"` });
        }
        return;
      }

      if (room.state !== 'LOBBY') {
        if (typeof callback === 'function') {
          callback({ success: false, message: 'เกมนี้เริ่มไปแล้ว ไม่สามารถเข้าร่วมได้' });
        }
        return;
      }

      room.addPlayer(socket.id, playerName, false);
      socket.join(room.code);
      if (typeof callback === 'function') {
        callback({ success: true, roomCode: room.code });
      }
      broadcastRoomState(room);
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 3. Update Deck (Host only)
  socket.on('update_deck', ({ deck }) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result || !result.player.isHost) return;
    result.room.setDeck(deck);
    broadcastRoomState(result.room);
  });

  // 4. Start Game (Host only)
  socket.on('start_game', (callback) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result || !result.player.isHost) return;

    const res = result.room.startGame();
    if (typeof callback === 'function') callback(res);
    broadcastRoomState(result.room);
  });

  // 5. Confirm Role Seen
  socket.on('confirm_role_seen', () => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    result.room.confirmRoleSeen(socket.id);
    broadcastRoomState(result.room);
  });

  // 6. Begin First Night (Host or auto)
  socket.on('begin_first_night', () => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result || !result.player.isHost) return;
    result.room.beginFirstNight();
    broadcastRoomState(result.room);
  });

  // 7. Night Action: Cupid
  socket.on('night_action_cupid', ({ lover1, lover2 }, callback) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    const res = result.room.handleCupidAction(socket.id, lover1, lover2);
    if (typeof callback === 'function') callback(res);
    broadcastRoomState(result.room);
  });

  // 8. Night Action: Doppelgänger
  socket.on('night_action_doppelganger', ({ targetId }, callback) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    const res = result.room.handleDoppelgangerAction(socket.id, targetId);
    if (typeof callback === 'function') callback(res);
    broadcastRoomState(result.room);
  });

  // 9. Night Action: Seer
  socket.on('night_action_seer', ({ targetId }, callback) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    const res = result.room.handleSeerAction(socket.id, targetId);
    if (typeof callback === 'function') callback(res);
    // Send immediate result to seer and update state
    broadcastRoomState(result.room);
  });

  socket.on('seer_complete', () => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result || result.room.nightStep !== 'seer') return;
    result.room.nextNightStep();
    broadcastRoomState(result.room);
  });

  // 10. Night Action: Sorcerer
  socket.on('night_action_sorcerer', ({ targetId }, callback) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    const res = result.room.handleSorcererAction(socket.id, targetId);
    if (typeof callback === 'function') callback(res);
  });

  socket.on('sorcerer_complete', () => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result || result.room.nightStep !== 'sorcerer') return;
    result.room.nextNightStep();
    broadcastRoomState(result.room);
  });

  // 11. Night Action: Werewolves voting
  socket.on('night_vote_werewolf', ({ targetId }) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    result.room.handleWerewolfVote(socket.id, targetId);
    broadcastRoomState(result.room);
  });

  socket.on('confirm_werewolf_kill', ({ targetId }) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    result.room.confirmWerewolfKill(targetId);
    broadcastRoomState(result.room);
  });

  // 12. Night Action: Bodyguard
  socket.on('night_action_bodyguard', ({ targetId }, callback) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    const res = result.room.handleBodyguardAction(socket.id, targetId);
    if (typeof callback === 'function') callback(res);
    broadcastRoomState(result.room);
  });

  // 13. Night Action: Witch
  socket.on('night_action_witch', ({ useHeal, poisonTargetId }, callback) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    const res = result.room.handleWitchAction(socket.id, useHeal, poisonTargetId);
    if (typeof callback === 'function') callback(res);
    broadcastRoomState(result.room);
  });

  // 14. Day Discussion Start
  socket.on('start_day_discussion', ({ timer = 180 } = {}) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result || !result.player.isHost) return;
    result.room.startDayDiscussion(timer);
    broadcastRoomState(result.room);
  });

  // 15. Start Voting Phase
  socket.on('start_voting', ({ timer = 60 } = {}) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result || !result.player.isHost) return;
    result.room.startVotingPhase(timer);
    broadcastRoomState(result.room);
  });

  // 16. Cast Vote
  socket.on('cast_vote', ({ targetId }) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    result.room.castVote(socket.id, targetId);

    // If everyone voted, auto notify or can wait for host
    broadcastRoomState(result.room);
  });

  // 17. Resolve Voting
  socket.on('resolve_voting', (callback) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result || !result.player.isHost) return;
    const summary = result.room.resolveVoting();
    if (typeof callback === 'function') callback({ success: true, summary });
    broadcastRoomState(result.room);
  });

  // 18. Hunter Shoot
  socket.on('hunter_shoot', ({ targetId }, callback) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result) return;
    const res = result.room.handleHunterShot(socket.id, targetId);
    if (typeof callback === 'function') callback(res);
    broadcastRoomState(result.room);
  });

  // 19. Next Night (Host button)
  socket.on('next_night', () => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result || !result.player.isHost) return;
    result.room.setupNightSequence();
    broadcastRoomState(result.room);
  });

  // 20. Restart Game
  socket.on('restart_game', () => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (!result || !result.player.isHost) return;
    result.room.state = 'LOBBY';
    result.room.winner = null;
    result.room.winReason = '';
    result.room.nightNumber = 0;
    result.room.dayNumber = 0;
    for (const player of result.room.players.values()) {
      player.isAlive = true;
      player.role = null;
      player.loverId = null;
      player.hasSeenRole = false;
    }
    result.room.log('รีเซ็ตเกมกลับสู่ห้องล็อบบี้แล้ว เตรียมเริ่มรอบใหม่!', 'highlight');
    broadcastRoomState(result.room);
  });

  // 21. Leave Room
  socket.on('leave_room', (callback) => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (result) {
      socket.leave(result.room.code);
      result.room.removePlayer(socket.id);
      if (result.room.players.size === 0) {
        gameManager.deleteRoom(result.room.code);
      } else {
        broadcastRoomState(result.room);
      }
    }
    if (typeof callback === 'function') callback({ success: true });
  });

  // 22. Disconnect
  socket.on('disconnect', () => {
    const result = gameManager.findPlayerRoom(socket.id);
    if (result) {
      result.room.removePlayer(socket.id);
      if (result.room.players.size === 0) {
        gameManager.deleteRoom(result.room.code);
      } else {
        broadcastRoomState(result.room);
      }
    }
  });
});

// Serve frontend build static files if dist folder exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For SPA routing, fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🐺 เกมล่าปริศนามนุษย์หมาป่า (Ultimate Werewolf Deluxe)`);
  console.log(`📡 เซิร์ฟเวอร์พร้อมทำงานแล้วที่:`);
  console.log(`👉 บนเครื่องนี้:  http://localhost:${PORT}`);
  console.log(`👉 บนมือถือในบ้าน: http://${localIp}:${PORT}`);
  console.log(`======================================================\n`);
});
