import { describe, it, expect } from 'vitest';
const { applyJankenThrow, applyTurnOrderChoice } = require('../gameEngine/jankenEngine');

function dummyCard(id) {
  return { id, type: 'cat', attribute: 'gorogoron', color: 'red' };
}

function makeJankenState() {
  return {
    players: [
      { deck: [dummyCard('d0')], hand: [dummyCard('h0_1')], field: [], house: [] },
      { deck: [dummyCard('d1')], hand: [dummyCard('h1_1')], field: [], house: [] },
    ],
    currentTurnPlayerIndex: null,
    turnCountPerPlayer: [0, 0],
    phase: 'janken',
    janken: { choices: [null, null], winnerIndex: null },
  };
}

describe('jankenEngine - applyJankenThrow', () => {
  it('records a single throw and keeps waiting for the other player', () => {
    const state = makeJankenState();
    const result = applyJankenThrow(state, 0, 'rock');
    expect(result.ok).toBe(true);
    expect(result.state.phase).toBe('janken');
    expect(result.state.janken.choices).toEqual(['rock', null]);
  });

  it('resets both choices on a draw (あいこ)', () => {
    let state = makeJankenState();
    state = applyJankenThrow(state, 0, 'rock').state;
    const result = applyJankenThrow(state, 1, 'rock');
    expect(result.ok).toBe(true);
    expect(result.state.phase).toBe('janken');
    expect(result.state.janken).toEqual({ choices: [null, null], winnerIndex: null });
  });

  it('decides a winner and moves to janken_choice when hands differ', () => {
    let state = makeJankenState();
    state = applyJankenThrow(state, 0, 'rock').state;
    const result = applyJankenThrow(state, 1, 'scissors'); // rock beats scissors -> player 0 wins
    expect(result.ok).toBe(true);
    expect(result.state.phase).toBe('janken_choice');
    expect(result.state.janken.winnerIndex).toBe(0);
    expect(result.state.janken.choices).toEqual(['rock', 'scissors']);
  });

  it('rejects throwing twice', () => {
    let state = makeJankenState();
    state = applyJankenThrow(state, 0, 'rock').state;
    const result = applyJankenThrow(state, 0, 'paper');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ALREADY_THROWN');
  });

  it('rejects an invalid hand shape', () => {
    const state = makeJankenState();
    const result = applyJankenThrow(state, 0, 'lizard');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('INVALID_HAND');
  });
});

describe('jankenEngine - applyTurnOrderChoice', () => {
  function stateWithWinner(winnerIndex) {
    let state = makeJankenState();
    state = applyJankenThrow(state, 0, 'rock').state;
    state = applyJankenThrow(state, 1, 'scissors').state; // winner is always 0 here
    if (winnerIndex === 1) {
      // rebuild with scissors/rock swapped so player 1 wins instead
      state = makeJankenState();
      state = applyJankenThrow(state, 0, 'scissors').state;
      state = applyJankenThrow(state, 1, 'rock').state;
    }
    return state;
  }

  it('lets the winner choose to go first, applying the opening draw', () => {
    const state = stateWithWinner(0);
    const result = applyTurnOrderChoice(state, 0, true);
    expect(result.ok).toBe(true);
    expect(result.state.phase).toBe('playing');
    expect(result.state.currentTurnPlayerIndex).toBe(0);
    expect(result.state.players[0].hand.length).toBe(2); // h0_1 + opening draw
  });

  it('lets the winner choose to go second instead', () => {
    const state = stateWithWinner(0);
    const result = applyTurnOrderChoice(state, 0, false);
    expect(result.ok).toBe(true);
    expect(result.state.currentTurnPlayerIndex).toBe(1);
  });

  it('rejects a turn-order choice from the non-winner', () => {
    const state = stateWithWinner(0);
    const result = applyTurnOrderChoice(state, 1, true);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('NOT_JANKEN_WINNER');
  });

  it('rejects the choice before the winner is decided', () => {
    const state = makeJankenState();
    const result = applyTurnOrderChoice(state, 0, true);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('WRONG_PHASE');
  });
});
