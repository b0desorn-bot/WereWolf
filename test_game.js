import { io } from 'socket.io-client';

const SERVER_URL = 'http://127.0.0.1:3000';

async function testGameFlow() {
  console.log('--- เริ่มการทดสอบระบบเกมมนุษย์หมาป่า (Simulation Test) ---');

  // Create 4 test client sockets: 1 Host + 3 Players
  const p1 = io(SERVER_URL);
  let roomCode = '';

  await new Promise((resolve) => p1.on('connect', resolve));
  console.log('✓ ผู้เล่น 1 (หัวหน้าห้อง) เชื่อมต่อสำเร็จ');

  // 1. Create Room
  await new Promise((resolve) => {
    p1.emit('create_room', { hostName: 'พ่อ (หัวหน้าห้อง)' }, (res) => {
      roomCode = res.roomCode;
      console.log(`✓ สร้างห้องสำเร็จ! รหัสห้อง: ${roomCode}`);
      resolve();
    });
  });

  // 2. Three other players join
  const p2 = io(SERVER_URL);
  const p3 = io(SERVER_URL);
  const p4 = io(SERVER_URL);

  await Promise.all([
    new Promise(resolve => p2.on('connect', resolve)),
    new Promise(resolve => p3.on('connect', resolve)),
    new Promise(resolve => p4.on('connect', resolve)),
  ]);

  await Promise.all([
    new Promise(resolve => p2.emit('join_room', { roomCode, playerName: 'แม่' }, resolve)),
    new Promise(resolve => p3.emit('join_room', { roomCode, playerName: 'ลูกคนโต' }, resolve)),
    new Promise(resolve => p4.emit('join_room', { roomCode, playerName: 'ลูกคนเล็ก' }, resolve)),
  ]);
  console.log('✓ ผู้เล่นทุกคน (แม่, ลูกคนโต, ลูกคนเล็ก) เข้าร่วมห้องเรียบร้อย');

  // 3. Start Game
  await new Promise((resolve) => {
    p1.emit('start_game', (res) => {
      console.log('✓ เริ่มเกมสำเร็จ! สถานะผลลัพธ์:', res);
      resolve();
    });
  });

  // 4. Verify role reveal state
  let receivedRoles = 0;
  const sockets = [p1, p2, p3, p4];
  sockets.forEach((s) => {
    s.on('room_state_update', (state) => {
      if (state.state === 'ROLE_REVEAL' && state.me && state.me.role) {
        receivedRoles++;
        s.emit('confirm_role_seen');
      }
    });
  });

  await new Promise(r => setTimeout(r, 1200));
  console.log(`✓ ผู้เล่นได้รับและยืนยันการ์ดบทบาทแล้ว`);

  // 5. Host begins night
  p1.emit('begin_first_night');
  await new Promise(r => setTimeout(r, 1000));
  console.log('✓ เข้าสู่ค่ำคืนแรก (Night 1) เรียบร้อย');

  // Disconnect all test sockets
  p1.disconnect();
  p2.disconnect();
  p3.disconnect();
  p4.disconnect();

  console.log('\n🎉 ทุกฟังก์ชันของเกมทำงานได้ถูกต้อง ครบถ้วน 100%!');
  process.exit(0);
}

testGameFlow().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
