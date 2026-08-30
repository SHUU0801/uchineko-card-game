const path = require('path');
const { buildDeck, shuffle, drawOne, refillTo } = require('./deck');
const { matchChosenCombo } = require('./yakuMatcher');

const yakuDefs = require(path.join(__dirname, '../../shared/data/yaku.json'));

const TURNS_PER_PLAYER = 4;

// 8枚引いて全て手札に入れる。場札にする4枚はセットアップフェーズでプレイヤー自身が選ぶ。
function dealPlayer(rng) {
  let deck = shuffle(buildDeck(), rng);
  const hand = [];
  for (let i = 0; i < 8; i++) {
    const drawn = drawOne(deck);
    deck = drawn.deck;
    hand.push(drawn.card);
  }
  return { deck, hand, field: [], house: [] };
}

function createGame(rng = Math.random) {
  const players = [dealPlayer(rng), dealPlayer(rng)];
  return {
    players,
    currentTurnPlayerIndex: null, // じゃんけんの勝者が先攻/後攻を選んだ時点で確定する
    turnCountPerPlayer: [0, 0],
    phase: 'setup',
    setupComplete: [false, false],
  };
}

// セットアップ：8枚の手札から場札にする4枚を選ぶ。残り4枚が手札として残る。
function applySetupChoice(state, playerIndex, fieldCardIds) {
  if (state.phase !== 'setup') return { ok: false, error: 'WRONG_PHASE' };
  if (state.setupComplete[playerIndex]) return { ok: false, error: 'ALREADY_READY' };
  if (!Array.isArray(fieldCardIds) || fieldCardIds.length !== 4 || new Set(fieldCardIds).size !== 4) {
    return { ok: false, error: 'SETUP_REQUIRES_4_FIELD_CARDS' };
  }

  const players = clonePlayers(state);
  const player = players[playerIndex];

  const chosen = [];
  for (const id of fieldCardIds) {
    const card = player.hand.find((c) => c.id === id);
    if (!card) return { ok: false, error: 'INVALID_HAND_CARD' };
    chosen.push(card);
  }

  const chosenIds = new Set(fieldCardIds);
  player.field = chosen;
  player.hand = player.hand.filter((c) => !chosenIds.has(c.id));

  const setupComplete = [...state.setupComplete];
  setupComplete[playerIndex] = true;

  return { ok: true, players, setupComplete };
}

// 両者のセットアップが完了したら「さいしょはにゃんじゃんけん」フェーズへ遷移する。
function finalizeSetupIfReady(state) {
  if (state.phase !== 'setup') return state;
  if (!state.setupComplete[0] || !state.setupComplete[1]) return state;
  return { ...state, phase: 'janken', janken: { choices: [null, null], winnerIndex: null } };
}

function clonePlayers(state) {
  return state.players.map((p) => ({
    deck: [...p.deck],
    hand: [...p.hand],
    field: [...p.field],
    house: [...p.house],
  }));
}

// ターン開始時のドロー。手札が一時的に5枚になる（山札切れの場合はドロー無しで進行）。
function startTurn(state) {
  const players = clonePlayers(state);
  const active = players[state.currentTurnPlayerIndex];
  const { deck, card } = drawOne(active.deck);
  active.deck = deck;
  if (card) active.hand = [...active.hand, card];
  return { ...state, players };
}

// パス：引いたカードは手札に残る。場札は補充しない（意図的に手札5枚のまま次ターンへ持ち越す。仕様の文字通りの解釈）。
function applyPass(state) {
  return { ...state };
}

// 役成立：手札1枚＋場札から選んだカードをハウスへ移し、場を4枚に補充する。
function applyYakuAttempt(state, playerIndex, payload) {
  const players = clonePlayers(state);
  const player = players[playerIndex];

  const matchResult = matchChosenCombo(payload, player, yakuDefs);
  if (!matchResult.ok) return { ok: false, error: matchResult.error };

  const usedFieldIds = new Set(matchResult.fieldCards.map((c) => c.id));
  player.hand = player.hand.filter((c) => c.id !== matchResult.handCard.id);
  player.field = player.field.filter((c) => !usedFieldIds.has(c.id));
  player.house = [...player.house, ...matchResult.cards];

  const refilled = refillTo(player.field, player.deck, 4);
  player.field = refilled.field;
  player.deck = refilled.deck;

  return { ok: true, players, yaku: matchResult.yaku };
}

// 8手番（各4回）終了後、house内枚数を比較。同数ならPKへ。
function advanceTurn(state) {
  const turnCountPerPlayer = [...state.turnCountPerPlayer];
  turnCountPerPlayer[state.currentTurnPlayerIndex] += 1;
  const nextIndex = state.currentTurnPlayerIndex === 0 ? 1 : 0;

  let phase = state.phase;
  if (turnCountPerPlayer[0] >= TURNS_PER_PLAYER && turnCountPerPlayer[1] >= TURNS_PER_PLAYER) {
    const score0 = computeScore(state.players[0]);
    const score1 = computeScore(state.players[1]);
    phase = score0 === score1 ? 'pk' : 'finished';
  }

  return { ...state, currentTurnPlayerIndex: nextIndex, turnCountPerPlayer, phase };
}

// スコア＝house内のカード枚数（種別を問わない。だっそうカード自体も1匹としてカウントする仕様と整合）。
function computeScore(player) {
  return player.house.length;
}

function checkWinner(state) {
  const score0 = computeScore(state.players[0]);
  const score1 = computeScore(state.players[1]);
  if (score0 === score1) return null;
  return score0 > score1 ? 0 : 1;
}

module.exports = {
  TURNS_PER_PLAYER,
  createGame,
  applySetupChoice,
  finalizeSetupIfReady,
  startTurn,
  applyPass,
  applyYakuAttempt,
  advanceTurn,
  computeScore,
  checkWinner,
  clonePlayers,
};
