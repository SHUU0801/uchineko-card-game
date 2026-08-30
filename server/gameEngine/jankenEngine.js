// 「さいしょはにゃんじゃんけん」：セットアップ完了後、先攻・後攻を決めるじゃんけん。
const { startTurn } = require('./turnManager');

const HANDS = ['rock', 'paper', 'scissors'];
const BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' };

function createJankenState() {
  return { choices: [null, null], winnerIndex: null };
}

// あいこの場合は両者リセットして同じフェーズのまま再挑戦させる。
function applyJankenThrow(state, playerIndex, hand) {
  if (state.phase !== 'janken') return { ok: false, error: 'WRONG_PHASE' };
  if (!HANDS.includes(hand)) return { ok: false, error: 'INVALID_HAND' };
  if (state.janken.choices[playerIndex]) return { ok: false, error: 'ALREADY_THROWN' };

  const choices = [...state.janken.choices];
  choices[playerIndex] = hand;

  if (choices[0] === null || choices[1] === null) {
    return { ok: true, state: { ...state, janken: { choices, winnerIndex: null } } };
  }

  if (choices[0] === choices[1]) {
    // あいこ：もう一度
    return { ok: true, state: { ...state, janken: createJankenState() } };
  }

  const winnerIndex = BEATS[choices[0]] === choices[1] ? 0 : 1;
  return { ok: true, state: { ...state, phase: 'janken_choice', janken: { choices, winnerIndex } } };
}

// じゃんけんの勝者が先攻・後攻を選ぶ。選んだら最初のドローまで自動で行う。
function applyTurnOrderChoice(state, playerIndex, goFirst) {
  if (state.phase !== 'janken_choice') return { ok: false, error: 'WRONG_PHASE' };
  if (state.janken.winnerIndex !== playerIndex) return { ok: false, error: 'NOT_JANKEN_WINNER' };

  const currentTurnPlayerIndex = goFirst ? playerIndex : playerIndex === 0 ? 1 : 0;
  const nextState = startTurn({ ...state, phase: 'playing', currentTurnPlayerIndex });
  return { ok: true, state: nextState };
}

module.exports = {
  createJankenState,
  applyJankenThrow,
  applyTurnOrderChoice,
};
