// CPU対戦：人間がいない側(プレイヤー1)の行動をサーバーが自動で決めて実行する。
// 既存のgameEngine純関数をそのまま呼び出すだけで、CPU専用の特別ルートは作らない。
const path = require('path');
const turnManager = require('./gameEngine/turnManager');
const jankenEngine = require('./gameEngine/jankenEngine');
const pkEngine = require('./gameEngine/pkEngine');
const { findPossibleYaku } = require('./gameEngine/yakuMatcher');

const yakuDefs = require(path.join(__dirname, '../shared/data/yaku.json'));

const CPU_INDEX = 1;
const CPU_THINK_DELAY_MS = 900;

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function decideSetupFieldIds(hand) {
  const shuffled = [...hand].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4).map((c) => c.id);
}

function decideJankenHand() {
  return randomChoice(['rock', 'paper', 'scissors']);
}

// 見つかった役の中からランダムに1つ選ぶ（簡易な思考ルーチン。だっそう/きまぐれは使わない）。
function decideTurnAction(player) {
  const options = findPossibleYaku(player, yakuDefs);
  if (options.length > 0) {
    const choice = randomChoice(options);
    return { type: 'yaku', handCardId: choice.handCardId, fieldCardIds: choice.fieldCardIds };
  }
  return { type: 'pass' };
}

function decidePkAction(drawnCard, field) {
  const pseudoPlayer = { hand: [drawnCard], field };
  const options = findPossibleYaku(pseudoPlayer, yakuDefs);
  if (options.length > 0) {
    const choice = randomChoice(options);
    return { fieldCardIds: choice.fieldCardIds };
  }
  return { pass: true };
}

// 現在の状態を見て、CPU(プレイヤー1)が何かすべきタイミングなら1手だけ実行する。
// 実行後は自分自身を再スケジュールし、あいこの連続や複数フェーズの連鎖にも対応する。
function scheduleCpuAction(io, room, broadcastViews, emitGameOverIfFinished) {
  if (!room.isCpuRoom || !room.state) return;
  const state = room.state;

  let action = null;

  if (state.phase === 'setup' && !state.setupComplete[CPU_INDEX]) {
    action = () => {
      const cpuPlayer = room.state.players[CPU_INDEX];
      const fieldCardIds = decideSetupFieldIds(cpuPlayer.hand);
      const result = turnManager.applySetupChoice(room.state, CPU_INDEX, fieldCardIds);
      if (result.ok) {
        room.state = { ...room.state, players: result.players, setupComplete: result.setupComplete };
        room.state = turnManager.finalizeSetupIfReady(room.state);
      }
    };
  } else if (state.phase === 'janken' && !state.janken.choices[CPU_INDEX]) {
    action = () => {
      const result = jankenEngine.applyJankenThrow(room.state, CPU_INDEX, decideJankenHand());
      if (result.ok) room.state = result.state;
    };
  } else if (state.phase === 'janken_choice' && state.janken.winnerIndex === CPU_INDEX) {
    action = () => {
      const result = jankenEngine.applyTurnOrderChoice(room.state, CPU_INDEX, Math.random() < 0.5);
      if (result.ok) room.state = result.state;
    };
  } else if (state.phase === 'playing' && state.currentTurnPlayerIndex === CPU_INDEX) {
    action = () => {
      const cpuPlayer = room.state.players[CPU_INDEX];
      const decided = decideTurnAction(cpuPlayer);
      let applied = false;
      if (decided.type === 'yaku') {
        const result = turnManager.applyYakuAttempt(room.state, CPU_INDEX, decided);
        if (result.ok) {
          room.state = { ...room.state, players: result.players };
          applied = true;
        }
      }
      if (!applied) {
        room.state = turnManager.applyPass(room.state);
      }
      room.state = turnManager.advanceTurn(room.state);
      if (room.state.phase === 'playing') {
        room.state = turnManager.startTurn(room.state);
      } else if (room.state.phase === 'pk') {
        room.state = pkEngine.startPkRound(room.state);
      }
    };
  } else if (state.phase === 'pk' && state.pk && !state.pk.acted[CPU_INDEX]) {
    action = () => {
      const drawnCard = room.state.pk.hands[CPU_INDEX];
      let result;
      if (drawnCard) {
        const cpuField = room.state.players[CPU_INDEX].field;
        const decided = decidePkAction(drawnCard, cpuField);
        result = pkEngine.applyPkAction(room.state, CPU_INDEX, decided);
      }
      if (!drawnCard || !result || !result.ok) {
        result = pkEngine.applyPkAction(room.state, CPU_INDEX, { pass: true });
      }
      if (result.ok) {
        room.state = { ...room.state, players: result.players, pk: result.pk };
        room.state = pkEngine.resolvePkRoundIfBothActed(room.state);
      }
    };
  }

  if (!action) return;

  setTimeout(() => {
    if (!room.state) return; // ルームが既に破棄されている場合は何もしない
    action();
    broadcastViews(io, room);
    emitGameOverIfFinished(io, room);
    scheduleCpuAction(io, room, broadcastViews, emitGameOverIfFinished);
  }, CPU_THINK_DELAY_MS);
}

module.exports = { scheduleCpuAction, CPU_INDEX };
