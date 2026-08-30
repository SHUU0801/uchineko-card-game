const path = require('path');
const { findPossibleYaku } = require('./yakuMatcher');

const yakuDefs = require(path.join(__dirname, '../../shared/data/yaku.json'));

// 非公開情報を漏らさない唯一の関所。すべてのクライアント送信はこの関数の戻り値のみを使うこと。
// 生のgameStateやplayers配列を直接emitしてはならない。
function buildPlayerView(state, playerIndex) {
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const me = state.players[playerIndex];
  const opponent = state.players[opponentIndex];

  const pk =
    state.phase === 'pk' && state.pk
      ? {
          myDrawnCard: state.pk.hands[playerIndex] || null,
          opponentHasDrawnCard: !!state.pk.hands[opponentIndex],
          myActed: state.pk.acted[playerIndex],
          opponentActed: state.pk.acted[opponentIndex],
          // PK中の役ヒント（非権威）。引いた1枚を仮の手札として判定する
          possibleYaku:
            state.pk.hands[playerIndex] && !state.pk.acted[playerIndex]
              ? findPossibleYaku({ hand: [state.pk.hands[playerIndex]], field: me.field }, yakuDefs)
              : [],
        }
      : null;

  // 自分の手札+場札だけから作れる役のヒント（非権威。UI表示専用、サーバー判定を置き換えない）
  const possibleYaku = state.phase === 'playing' ? findPossibleYaku(me, yakuDefs) : [];

  // じゃんけん：相手の手は決着がつくまで見せない（決着後=janken_choice以降のみ開示）
  const janken =
    (state.phase === 'janken' || state.phase === 'janken_choice') && state.janken
      ? {
          myChoice: state.janken.choices[playerIndex],
          opponentHasChosen: state.janken.choices[opponentIndex] !== null,
          revealedChoices: state.phase === 'janken_choice' ? state.janken.choices : null,
          winnerIndex: state.janken.winnerIndex,
        }
      : null;

  return {
    myIndex: playerIndex,
    phase: state.phase,
    currentTurnPlayerIndex: state.currentTurnPlayerIndex,
    turnCountPerPlayer: state.turnCountPerPlayer,
    setupComplete: state.setupComplete || null,
    me: {
      hand: me.hand,
      deckCount: me.deck.length,
      field: me.field,
      house: me.house,
      possibleYaku,
    },
    opponent: {
      handCount: opponent.hand.length,
      deckCount: opponent.deck.length,
      field: opponent.field,
      house: opponent.house,
    },
    pk,
    janken,
  };
}

module.exports = { buildPlayerView };
