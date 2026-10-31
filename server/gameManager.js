import { GameRoom } from './gameRoom.js';

export class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostSocketId, hostName) {
    const code = this.generateRoomCode();
    const room = new GameRoom(code, hostSocketId, hostName);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase());
  }

  deleteRoom(code) {
    this.rooms.delete(code.toUpperCase());
  }

  findPlayerRoom(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.has(socketId)) {
        return { room, player: room.players.get(socketId) };
      }
    }
    return null;
  }
}
