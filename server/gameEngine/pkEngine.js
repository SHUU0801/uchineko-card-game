const path = require('path');
const { drawOne, refillTo } = require('./deck');
const { matchChosenCombo } = require('./yakuMatcher');
const { computeScore, clonePlayers } = require('./turnManager');

const yakuDefs = require(path.join(__dirname, '../../shared/data/yaku.json'));

// サドンデス1ラウンド開始：両者が自分の山札から1枚同時に引く。
// 山札が尽きているプレイヤーは引けないため、そのラウンドは自動パス扱いにする（仕様に明記のない推論フォールバック）。
function startPkRound(state) {
  const players = clonePlayers(state);
  const hands = [null, null];
  for (let i = 0; i < 2; i++) {
    const { deck, card } = drawOne(players[i].deck);
    players[i].deck = deck;
    hands[i] = card;
  }
  const acted = [hands[0] === null, hands[1] === null];
  return { ...state, players, phase: 'pk', pk: { hands, acted } };
}

// 場札(＋引いた1枚)で役を作る。成立分はhouseに累積（リセットしない）。
function applyPkAction(state, playerIndex, payload) {
  if (state.pk.acted[playerIndex]) {
    return { ok: false, error: 'ALREADY_ACTED' };
  }

  const pk = { hands: [...state.pk.hands], acted: [...state.pk.acted] };

  if (payload && payload.pass) {
    pk.acted[playerIndex] = true;
    return { ok: true, players: state.players, pk };
  }

  const drawnCard = pk.hands[playerIndex];
  if (!drawnCard) {
    return { ok: false, error: 'NO_DRAWN_CARD' };
  }

  const players = clonePlayers(state);
  const player = players[playerIndex];
  const pseudoPlayer = { hand: [drawnCard], field: player.field };

  const matchResult = matchChosenCombo(
    { handCardId: drawnCard.id, fieldCardIds: payload.fieldCardIds },
    pseudoPlayer,
    yakuDefs
  );
  if (!matchResult.ok) return { ok: false, error: matchResult.error };

  const usedFieldIds = new Set(matchResult.fieldCards.map((c) => c.id));
  player.field = player.field.filter((c) => !usedFieldIds.has(c.id));
  player.house = [...player.house, ...matchResult.cards];

  const refilled = refillTo(player.field, player.deck, 4);
  player.field = refilled.field;
  player.deck = refilled.deck;

  pk.hands[playerIndex] = null;
  pk.acted[playerIndex] = true;

  return { ok: true, players, pk, yaku: matchResult.yaku };
}

// 両者の行動が出揃ったら判定：差がついていれば終了、同点ならもう1ラウンド。
function resolvePkRoundIfBothActed(state) {
  if (!state.pk.acted[0] || !state.pk.acted[1]) return state;

  const score0 = computeScore(state.players[0]);
  const score1 = computeScore(state.players[1]);
  if (score0 !== score1) {
    return { ...state, phase: 'finished' };
  }
  return startPkRound(state);
}

module.exports = {
  startPkRound,
  applyPkAction,
  resolvePkRoundIfBothActed,
};
