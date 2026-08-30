import { describe, it, expect } from 'vitest';
const {
  createGame,
  applySetupChoice,
  finalizeSetupIfReady,
  startTurn,
  applyPass,
  applyYakuAttempt,
  advanceTurn,
  checkWinner,
} = require('../gameEngine/turnManager');

function dummyCard(id, type = 'cat', extra = {}) {
  return { id, type, ...extra };
}

function makeState(overrides = {}) {
  const base = {
    players: [
      {
        deck: [dummyCard('d0_1'), dummyCard('d0_2'), dummyCard('d0_3')],
        hand: [dummyCard('h0_1'), dummyCard('h0_2'), dummyCard('h0_3'), dummyCard('h0_4')],
        field: [dummyCard('f0_1'), dummyCard('f0_2'), dummyCard('f0_3'), dummyCard('f0_4')],
        house: [],
      },
      {
        deck: [dummyCard('d1_1'), dummyCard('d1_2'), dummyCard('d1_3')],
        hand: [dummyCard('h1_1'), dummyCard('h1_2'), dummyCard('h1_3'), dummyCard('h1_4')],
        field: [dummyCard('f1_1'), dummyCard('f1_2'), dummyCard('f1_3'), dummyCard('f1_4')],
        house: [],
      },
    ],
    currentTurnPlayerIndex: 0,
    turnCountPerPlayer: [0, 0],
    phase: 'playing',
  };
  return { ...base, ...overrides };
}

describe('turnManager - createGame', () => {
  it('deals 32 cards per player as 8 hand + 0 field + 24 deck, phase setup', () => {
    const state = createGame(Math.random);
    state.players.forEach((p) => {
      expect(p.field.length).toBe(0);
      expect(p.hand.length).toBe(8);
      expect(p.deck.length).toBe(24);
      expect(p.house.length).toBe(0);
      expect(p.field.length + p.hand.length + p.deck.length + p.house.length).toBe(32);
    });
    // 先攻/後攻はこの時点では未確定（じゃんけんの勝者が選ぶ）
    expect(state.currentTurnPlayerIndex).toBe(null);
    expect(state.turnCountPerPlayer).toEqual([0, 0]);
    expect(state.phase).toBe('setup');
    expect(state.setupComplete).toEqual([false, false]);
  });
});

describe('turnManager - applySetupChoice / finalizeSetupIfReady', () => {
  it('splits the chosen 4 cards into field, leaving the other 4 in hand', () => {
    const state = createGame(Math.random);
    const chosenIds = state.players[0].hand.slice(0, 4).map((c) => c.id);

    const result = applySetupChoice(state, 0, chosenIds);

    expect(result.ok).toBe(true);
    expect(result.players[0].field.map((c) => c.id).sort()).toEqual([...chosenIds].sort());
    expect(result.players[0].hand.length).toBe(4);
    expect(result.setupComplete).toEqual([true, false]);
  });

  it('rejects a selection that is not exactly 4 cards', () => {
    const state = createGame(Math.random);
    const chosenIds = state.players[0].hand.slice(0, 3).map((c) => c.id);
    const result = applySetupChoice(state, 0, chosenIds);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('SETUP_REQUIRES_4_FIELD_CARDS');
  });

  it('stays in setup until both players have chosen, then transitions to janken (先攻/後攻を決める前段階)', () => {
    let state = createGame(Math.random);
    const ids0 = state.players[0].hand.slice(0, 4).map((c) => c.id);
    const ids1 = state.players[1].hand.slice(0, 4).map((c) => c.id);

    let result = applySetupChoice(state, 0, ids0);
    state = { ...state, players: result.players, setupComplete: result.setupComplete };
    state = finalizeSetupIfReady(state);
    expect(state.phase).toBe('setup'); // player 1 hasn't chosen yet

    result = applySetupChoice(state, 1, ids1);
    state = { ...state, players: result.players, setupComplete: result.setupComplete };
    state = finalizeSetupIfReady(state);

    expect(state.phase).toBe('janken');
    expect(state.janken).toEqual({ choices: [null, null], winnerIndex: null });
  });
});

describe('turnManager - startTurn', () => {
  it('draws 1 card into the active player hand (4 -> 5) and shrinks their deck by 1', () => {
    const state = makeState();
    const next = startTurn(state);
    expect(next.players[0].hand.length).toBe(5);
    expect(next.players[0].deck.length).toBe(2);
    // opponent untouched
    expect(next.players[1].hand.length).toBe(4);
    expect(next.players[1].deck.length).toBe(3);
  });
});

describe('turnManager - applyYakuAttempt', () => {
  it('on success, consumes 1 hand + N field cards into house, and refills field back to 4', () => {
    const state = makeState({
      players: [
        {
          deck: [dummyCard('refill_1')],
          hand: [
            dummyCard('h0_1'),
            dummyCard('h0_2'),
            dummyCard('h0_3'),
            dummyCard('drawn', 'cat', { attribute: 'gorogoron' }), // the "temporarily 5th" hand card
          ],
          field: [
            dummyCard('f0_1', 'cat', { attribute: 'daran' }),
            dummyCard('f0_2'),
            dummyCard('f0_3'),
            dummyCard('f0_4'),
          ],
          house: [],
        },
        makeState().players[1],
      ],
    });

    const result = applyYakuAttempt(state, 0, { handCardId: 'drawn', fieldCardIds: ['f0_1'] });

    expect(result.ok).toBe(true);
    expect(result.yaku.id).toBe('hesoten_biyori');

    const player = result.players[0];
    expect(player.hand.length).toBe(3); // 4 -> 3 (the drawn card was consumed, no other change)
    expect(player.house.length).toBe(2); // drawn + f0_1
    expect(player.field.length).toBe(4); // f0_1 removed then refilled from deck
    expect(player.field.some((c) => c.id === 'refill_1')).toBe(true);
    expect(player.deck.length).toBe(0);
  });

  it('on failure, returns ok:false and does not mutate anything (caller keeps original state)', () => {
    const state = makeState();
    const result = applyYakuAttempt(state, 0, { handCardId: 'h0_1', fieldCardIds: ['f0_1'] });
    expect(result.ok).toBe(false);
  });
});

describe('turnManager - applyPass', () => {
  it('leaves hand size and field untouched (drawn card stays in hand)', () => {
    const state = makeState({
      players: [
        {
          ...makeState().players[0],
          hand: [dummyCard('h0_1'), dummyCard('h0_2'), dummyCard('h0_3'), dummyCard('h0_4'), dummyCard('drawn')],
        },
        makeState().players[1],
      ],
    });
    const next = applyPass(state);
    expect(next.players[0].hand.length).toBe(5);
    expect(next.players[0].field.length).toBe(4);
  });
});

describe('turnManager - advanceTurn', () => {
  it('flips the active player and keeps phase playing before both reach 4 turns', () => {
    const state = makeState({ currentTurnPlayerIndex: 0, turnCountPerPlayer: [1, 2] });
    const next = advanceTurn(state);
    expect(next.turnCountPerPlayer).toEqual([2, 2]);
    expect(next.currentTurnPlayerIndex).toBe(1);
    expect(next.phase).toBe('playing');
  });

  it('resolves to finished with the correct winner once both reach 4 turns and scores differ', () => {
    const state = makeState({
      currentTurnPlayerIndex: 0,
      turnCountPerPlayer: [3, 4],
      players: [
        { ...makeState().players[0], house: [dummyCard('c1'), dummyCard('c2'), dummyCard('c3'), dummyCard('c4'), dummyCard('c5')] },
        { ...makeState().players[1], house: [dummyCard('c6'), dummyCard('c7')] },
      ],
    });
    const next = advanceTurn(state);
    expect(next.turnCountPerPlayer).toEqual([4, 4]);
    expect(next.phase).toBe('finished');
    expect(checkWinner(next)).toBe(0);
  });

  it('resolves to pk once both reach 4 turns with tied scores', () => {
    const state = makeState({
      currentTurnPlayerIndex: 0,
      turnCountPerPlayer: [3, 4],
      players: [
        { ...makeState().players[0], house: [dummyCard('c1'), dummyCard('c2')] },
        { ...makeState().players[1], house: [dummyCard('c3'), dummyCard('c4')] },
      ],
    });
    const next = advanceTurn(state);
    expect(next.phase).toBe('pk');
    expect(checkWinner(next)).toBe(null);
  });
});
