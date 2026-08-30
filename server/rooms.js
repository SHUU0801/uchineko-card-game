// インメモリのルームコード管理。DB・認証なし（MVPスコープ）。
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字(0/O, 1/I)を除外
const ROOM_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6時間放置されたルームを掃除
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

// CPU対戦ルームのプレイヤー1に割り当てる、実ソケットIDと衝突しないダミー値。
const CPU_MARKER = 'CPU_BOT';

const rooms = new Map();

function generateRoomCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () => ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function createRoom(socketId) {
  const code = generateRoomCode();
  const room = {
    code,
    sockets: [socketId, null],
    state: null,
    isCpuRoom: false,
    rematchVotes: [false, false],
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  return room;
}

// CPU対戦：プレイヤー1をCPU_MARKERで埋め、参加待ちなしで即座に開始できるようにする。
function createCpuRoom(socketId) {
  const room = createRoom(socketId);
  room.sockets[1] = CPU_MARKER;
  room.isCpuRoom = true;
  return room;
}

function joinRoom(code, socketId) {
  const room = rooms.get(code);
  if (!room) return { ok: false, error: 'ROOM_NOT_FOUND' };
  if (room.sockets[1] && room.sockets[1] !== socketId) {
    return { ok: false, error: 'ROOM_FULL' };
  }
  room.sockets[1] = socketId;
  return { ok: true, room };
}

function getRoomByCode(code) {
  return rooms.get(code) || null;
}

function getRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.sockets.includes(socketId)) return room;
  }
  return null;
}

function getPlayerIndex(room, socketId) {
  return room.sockets.indexOf(socketId);
}

function isRealSocketSlot(value) {
  return !!value && value !== CPU_MARKER;
}

function leaveRoom(socketId) {
  const room = getRoomBySocket(socketId);
  if (!room) return null;
  const idx = getPlayerIndex(room, socketId);
  if (idx !== -1) room.sockets[idx] = null;
  // CPU対戦ルームは人間が抜けた時点で（CPU側だけ残っても意味が無いので）即座に破棄する
  if (!isRealSocketSlot(room.sockets[0]) && !isRealSocketSlot(room.sockets[1])) {
    rooms.delete(room.code);
  }
  return room;
}

function cleanupStaleRooms() {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    const isEmpty = !isRealSocketSlot(room.sockets[0]) && !isRealSocketSlot(room.sockets[1]);
    if (isEmpty && now - room.createdAt > ROOM_MAX_AGE_MS) {
      rooms.delete(code);
    }
  }
}

setInterval(cleanupStaleRooms, CLEANUP_INTERVAL_MS).unref();

module.exports = {
  CPU_MARKER,
  createRoom,
  createCpuRoom,
  joinRoom,
  getRoomByCode,
  getRoomBySocket,
  getPlayerIndex,
  leaveRoom,
};
