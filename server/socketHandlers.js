// socket.ioイベントの薄いアダプタ層。ゲームルール自体はgameEngine配下の純関数に委譲する。
const rooms = require('./rooms');
const turnManager = require('./gameEngine/turnManager');
const specialActions = require('./gameEngine/specialActions');
const pkEngine = require('./gameEngine/pkEngine');
const jankenEngine = require('./gameEngine/jankenEngine');
const cpuController = require('./cpuController');
const { buildPlayerView } = require('./gameEngine/viewBuilder');

// 状態更新の送信経路を単一化：どのハンドラからもこの関数を通してのみ配信することで、
// 非公開情報(相手の手札/山札の中身)のリーク漏れを構造的に防ぐ。
function broadcastViews(io, room) {
  room.sockets.forEach((socketId, idx) => {
    if (!socketId || socketId === rooms.CPU_MARKER || !room.state) return;
    io.to(socketId).emit('state_update', buildPlayerView(room.state, idx));
  });
}

function maybeAdvancePhaseAfterAction(room) {
  room.state = turnManager.advanceTurn(room.state);
  if (room.state.phase === 'playing') {
    room.state = turnManager.startTurn(room.state);
  } else if (room.state.phase === 'pk') {
    room.state = pkEngine.startPkRound(room.state);
  }
}

function emitGameOverIfFinished(io, room) {
  if (room.state.phase !== 'finished') return;
  const winnerIndex = turnManager.checkWinner(room.state);
  const finalScores = [turnManager.computeScore(room.state.players[0]), turnManager.computeScore(room.state.players[1])];
  io.to(room.code).emit('game_over', { winnerIndex, finalScores });
}

function runCpu(io, room) {
  cpuController.scheduleCpuAction(io, room, broadcastViews, emitGameOverIfFinished);
}

function requireActiveRoom(socket) {
  const room = rooms.getRoomBySocket(socket.id);
  if (!room || !room.state) return { error: 'ROOM_NOT_FOUND' };
  const playerIndex = rooms.getPlayerIndex(room, socket.id);
  if (playerIndex === -1) return { error: 'NOT_IN_ROOM' };
  return { room, playerIndex };
}

function requireMyTurn(socket, room, playerIndex, expectedPhase) {
  if (room.state.phase !== expectedPhase) return { error: 'WRONG_PHASE' };
  if (expectedPhase === 'playing' && room.state.currentTurnPlayerIndex !== playerIndex) {
    return { error: 'NOT_YOUR_TURN' };
  }
  return {};
}

module.exports = function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('create_room', () => {
      const room = rooms.createRoom(socket.id);
      socket.join(room.code);
      socket.emit('room_created', { roomCode: room.code });
    });

    socket.on('create_cpu_room', () => {
      const room = rooms.createCpuRoom(socket.id);
      socket.join(room.code);
      socket.emit('room_created', { roomCode: room.code, vsCpu: true });

      room.state = turnManager.createGame(Math.random);
      broadcastViews(io, room);
      runCpu(io, room);
    });

    socket.on('join_room', ({ roomCode }) => {
      const result = rooms.joinRoom(roomCode, socket.id);
      if (!result.ok) {
        socket.emit('error', { code: result.error, message: result.error });
        return;
      }
      const room = result.room;
      socket.join(room.code);
      socket.emit('room_joined', { roomCode: room.code, myIndex: 1 });
      io.to(room.sockets[0]).emit('opponent_joined', {});

      // 両者揃ったのでサーバー側でコイントス（先攻/後攻）→8枚配布まで自動で行う。
      // 場札にする4枚は各プレイヤーがセットアップフェーズで選ぶ（choose_field）。
      room.state = turnManager.createGame(Math.random);
      broadcastViews(io, room);
    });

    socket.on('choose_field', ({ fieldCardIds }) => {
      const ctx = requireActiveRoom(socket);
      if (ctx.error) return socket.emit('error', { code: ctx.error, message: ctx.error });
      const { room, playerIndex } = ctx;

      if (room.state.phase !== 'setup') {
        return socket.emit('error', { code: 'WRONG_PHASE', message: 'WRONG_PHASE' });
      }

      const result = turnManager.applySetupChoice(room.state, playerIndex, fieldCardIds || []);
      if (!result.ok) return socket.emit('error', { code: result.error, message: result.error });

      room.state = { ...room.state, players: result.players, setupComplete: result.setupComplete };
      room.state = turnManager.finalizeSetupIfReady(room.state);
      broadcastViews(io, room);
      runCpu(io, room);
    });

    socket.on('janken_throw', ({ hand }) => {
      const ctx = requireActiveRoom(socket);
      if (ctx.error) return socket.emit('error', { code: ctx.error, message: ctx.error });
      const { room, playerIndex } = ctx;

      const result = jankenEngine.applyJankenThrow(room.state, playerIndex, hand);
      if (!result.ok) return socket.emit('error', { code: result.error, message: result.error });

      room.state = result.state;
      broadcastViews(io, room);
      runCpu(io, room);
    });

    socket.on('choose_turn_order', ({ goFirst }) => {
      const ctx = requireActiveRoom(socket);
      if (ctx.error) return socket.emit('error', { code: ctx.error, message: ctx.error });
      const { room, playerIndex } = ctx;

      const result = jankenEngine.applyTurnOrderChoice(room.state, playerIndex, !!goFirst);
      if (!result.ok) return socket.emit('error', { code: result.error, message: result.error });

      room.state = result.state;
      io.to(room.code).emit('game_start', { firstPlayerIndex: room.state.currentTurnPlayerIndex });
      broadcastViews(io, room);
      runCpu(io, room);
    });

    socket.on('attempt_yaku', (payload) => {
      const ctx = requireActiveRoom(socket);
      if (ctx.error) return socket.emit('error', { code: ctx.error, message: ctx.error });
      const { room, playerIndex } = ctx;

      const turnCheck = requireMyTurn(socket, room, playerIndex, 'playing');
      if (turnCheck.error) return socket.emit('error', { code: turnCheck.error, message: turnCheck.error });

      const result = turnManager.applyYakuAttempt(room.state, playerIndex, payload || {});
      if (!result.ok) return socket.emit('error', { code: result.error, message: result.error });

      room.state = { ...room.state, players: result.players };
      maybeAdvancePhaseAfterAction(room);

      io.to(room.code).emit('action_result', {
        ok: true,
        kind: result.yaku.category === 'pair' ? 'pair' : 'yaku',
        yakuName: result.yaku.name,
        cardsMoved: result.yaku.cardCount,
      });
      broadcastViews(io, room);
      emitGameOverIfFinished(io, room);
      runCpu(io, room);
    });

    socket.on('activate_dassou', (payload) => {
      const ctx = requireActiveRoom(socket);
      if (ctx.error) return socket.emit('error', { code: ctx.error, message: ctx.error });
      const { room, playerIndex } = ctx;

      const turnCheck = requireMyTurn(socket, room, playerIndex, 'playing');
      if (turnCheck.error) return socket.emit('error', { code: turnCheck.error, message: turnCheck.error });

      const result = specialActions.validateAndApplyDassou(room.state, playerIndex, payload || {});
      if (!result.ok) return socket.emit('error', { code: result.error, message: result.error });

      room.state = { ...room.state, players: result.players };
      maybeAdvancePhaseAfterAction(room);

      io.to(room.code).emit('action_result', { ok: true, kind: 'dassou', cardsMoved: 5 });
      broadcastViews(io, room);
      emitGameOverIfFinished(io, room);
      runCpu(io, room);
    });

    socket.on('activate_kimagure', (payload) => {
      const ctx = requireActiveRoom(socket);
      if (ctx.error) return socket.emit('error', { code: ctx.error, message: ctx.error });
      const { room, playerIndex } = ctx;

      const turnCheck = requireMyTurn(socket, room, playerIndex, 'playing');
      if (turnCheck.error) return socket.emit('error', { code: turnCheck.error, message: turnCheck.error });

      const result = specialActions.validateAndApplyKimagure(room.state, playerIndex, payload || {});
      if (!result.ok) return socket.emit('error', { code: result.error, message: result.error });

      room.state = { ...room.state, players: result.players };
      maybeAdvancePhaseAfterAction(room);

      io.to(room.code).emit('action_result', { ok: true, kind: 'kimagure', cardsMoved: 2 });
      broadcastViews(io, room);
      emitGameOverIfFinished(io, room);
      runCpu(io, room);
    });

    socket.on('pass_turn', () => {
      const ctx = requireActiveRoom(socket);
      if (ctx.error) return socket.emit('error', { code: ctx.error, message: ctx.error });
      const { room, playerIndex } = ctx;

      const turnCheck = requireMyTurn(socket, room, playerIndex, 'playing');
      if (turnCheck.error) return socket.emit('error', { code: turnCheck.error, message: turnCheck.error });

      room.state = turnManager.applyPass(room.state);
      maybeAdvancePhaseAfterAction(room);

      io.to(room.code).emit('action_result', { ok: true, kind: 'pass' });
      broadcastViews(io, room);
      emitGameOverIfFinished(io, room);
      runCpu(io, room);
    });

    socket.on('pk_action', (payload) => {
      const ctx = requireActiveRoom(socket);
      if (ctx.error) return socket.emit('error', { code: ctx.error, message: ctx.error });
      const { room, playerIndex } = ctx;

      const turnCheck = requireMyTurn(socket, room, playerIndex, 'pk');
      if (turnCheck.error) return socket.emit('error', { code: turnCheck.error, message: turnCheck.error });

      const result = pkEngine.applyPkAction(room.state, playerIndex, payload || {});
      if (!result.ok) return socket.emit('error', { code: result.error, message: result.error });

      room.state = { ...room.state, players: result.players, pk: result.pk };
      room.state = pkEngine.resolvePkRoundIfBothActed(room.state);

      io.to(room.code).emit('action_result', {
        ok: true,
        kind: result.yaku ? (result.yaku.category === 'pair' ? 'pair' : 'yaku') : 'pass',
        yakuName: result.yaku ? result.yaku.name : undefined,
        cardsMoved: result.yaku ? result.yaku.cardCount : undefined,
      });
      broadcastViews(io, room);
      emitGameOverIfFinished(io, room);
      runCpu(io, room);
    });

    socket.on('request_rematch', () => {
      const ctx = requireActiveRoom(socket);
      if (ctx.error) return socket.emit('error', { code: ctx.error, message: ctx.error });
      const { room, playerIndex } = ctx;

      if (room.state.phase !== 'finished') {
        return socket.emit('error', { code: 'WRONG_PHASE', message: 'WRONG_PHASE' });
      }

      room.rematchVotes = room.rematchVotes || [false, false];
      room.rematchVotes[playerIndex] = true;
      if (room.isCpuRoom) room.rematchVotes[1] = true; // CPUは常に再戦OK

      if (room.rematchVotes[0] && room.rematchVotes[1]) {
        room.rematchVotes = [false, false];
        room.state = turnManager.createGame(Math.random);
        broadcastViews(io, room);
        runCpu(io, room);
      } else {
        io.to(room.code).emit('rematch_status', { votes: room.rematchVotes });
      }
    });

    socket.on('leave_room', () => {
      const room = rooms.leaveRoom(socket.id);
      if (room) io.to(room.code).emit('opponent_left', {});
    });

    socket.on('disconnect', () => {
      const room = rooms.leaveRoom(socket.id);
      if (room) io.to(room.code).emit('opponent_left', {});
    });
  });
};
