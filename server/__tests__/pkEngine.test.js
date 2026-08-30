import { describe, it, expect } from 'vitest';
const { startPkRound, applyPkAction, resolvePkRoundIfBothActed } = require('../gameEngine/pkEngine');

function cat(id, attribute = 'gorogoron') {
  return { id, type: 'cat', attribute, color: 'red' };
}

function baseState(overrides = {}) {
  return {
    players: [
      { deck: [cat('d0_draw')], hand: [], field: [cat('f0_1'), cat('f0_2', 'daran'), cat('f0_3'), cat('f0_4')], house: [] },
      { deck: [cat('d1_draw')], hand: [], field: [cat('f1_1'), cat('f1_2', 'daran'), cat('f1_3'), cat('f1_4')], house: [] },
    ],
    phase: 'playing',
    ...overrides,
  };
}

describe('pkEngine - startPkRound', () => {
  it('draws 1 card per player into pk.hands and marks phase pk', () => {
    const state = baseState();
    const next = startPkRound(state);
    expect(next.phase).toBe('pk');
    expect(next.pk.hands[0].id).toBe('d0_draw');
    expect(next.pk.hands[1].id).toBe('d1_draw');
    expect(next.pk.acted).toEqual([false, false]);
    expect(next.players[0].deck.length).toBe(0);
  });

  it('auto-passes a player whose deck is empty (cannot draw)', () => {
    const state = baseState({
      players: [
        { deck: [], hand: [], field: [cat('f0_1')], house: [] },
        { deck: [cat('d1_draw')], hand: [], field: [cat('f1_1')], house: [] },
      ],
    });
    const next = startPkRound(state);
    expect(next.pk.hands[0]).toBe(null);
    expect(next.pk.acted[0]).toBe(true);
    expect(next.pk.acted[1]).toBe(false);
  });
});

describe('pkEngine - applyPkAction', () => {
  it('pass marks acted without changing any card zones', () => {
    const state = { ...baseState(), phase: 'pk', pk: { hands: [cat('drawn0'), cat('drawn1')], acted: [false, false] } };
    const result = applyPkAction(state, 0, { pass: true });
    expect(result.ok).toBe(true);
    expect(result.pk.acted).toEqual([true, false]);
    expect(result.players).toBe(state.players); // unchanged
  });

  it('a successful yaku moves the drawn card + used field cards into house, refills field, marks acted', () => {
    const drawn = cat('drawn0', 'daran'); // pairs with f0_2 (daran) via generic_pair, or with f0_1(gorogoron) via named yaku
    const state = { ...baseState(), phase: 'pk', pk: { hands: [drawn, cat('drawn1')], acted: [false, false] } };

    const result = applyPkAction(state, 0, { fieldCardIds: ['f0_1'] }); // gorogoron + daran -> hesoten_biyori

    expect(result.ok).toBe(true);
    expect(result.yaku.id).toBe('hesoten_biyori');
    expect(result.pk.hands[0]).toBe(null);
    expect(result.pk.acted[0]).toBe(true);

    const p0 = result.players[0];
    expect(p0.house.length).toBe(2);
    expect(p0.field.length).toBe(4); // f0_1 removed, refilled from deck
  });

  it('rejects acting twice in the same round', () => {
    const state = { ...baseState(), phase: 'pk', pk: { hands: [cat('drawn0'), cat('drawn1')], acted: [true, false] } };
    const result = applyPkAction(state, 0, { pass: true });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ALREADY_ACTED');
  });
});

describe('pkEngine - resolvePkRoundIfBothActed', () => {
  it('does nothing until both players have acted', () => {
    const state = { ...baseState(), phase: 'pk', pk: { hands: [null, null], acted: [true, false] } };
    const next = resolvePkRoundIfBothActed(state);
    expect(next).toBe(state);
  });

  it('ends the game (finished) once scores differ', () => {
    const state = {
      players: [
        { ...baseState().players[0], house: [cat('h1'), cat('h2')] },
        { ...baseState().players[1], house: [cat('h3')] },
      ],
      phase: 'pk',
      pk: { hands: [null, null], acted: [true, true] },
    };
    const next = resolvePkRoundIfBothActed(state);
    expect(next.phase).toBe('finished');
  });

  it('starts another round (cumulative house, not reset) when scores remain tied', () => {
    const state = {
      players: [
        { deck: [cat('d0')], hand: [], field: [cat('f0')], house: [cat('h1')] },
        { deck: [cat('d1')], hand: [], field: [cat('f1')], house: [cat('h2')] },
      ],
      phase: 'pk',
      pk: { hands: [null, null], acted: [true, true] },
    };
    const next = resolvePkRoundIfBothActed(state);
    expect(next.phase).toBe('pk');
    expect(next.pk.acted).toEqual([false, false]);
    // house untouched/cumulative across the round transition
    expect(next.players[0].house.map((c) => c.id)).toEqual(['h1']);
    expect(next.players[1].house.map((c) => c.id)).toEqual(['h2']);
  });
});
