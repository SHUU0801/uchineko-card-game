import { describe, it, expect } from 'vitest';
const { validateAndApplyDassou, validateAndApplyKimagure } = require('../gameEngine/specialActions');

function cat(id, attribute = 'gorogoron') {
  return { id, type: 'cat', attribute, color: 'red' };
}
function dassou(id = 'dassou_1') {
  return { id, type: 'dassou' };
}
function kimagure(id = 'kimagure_1') {
  return { id, type: 'kimagure' };
}

function allIds(...arrays) {
  return arrays.flat().map((c) => c.id);
}

describe('specialActions - だっそう', () => {
  it('case A: dassou card is in hand, 4 attribute cards from field -> net 1 hand + 4 field', () => {
    const d = dassou();
    const f1 = cat('f1');
    const f2 = cat('f2');
    const f3 = cat('f3');
    const f4 = cat('f4');
    const refill = cat('refill');

    const state = {
      players: [
        { deck: [refill], hand: [d], field: [f1, f2, f3, f4], house: [] },
        { deck: [], hand: [], field: [], house: [cat('opp_house_1'), cat('opp_house_2')] },
      ],
    };

    const result = validateAndApplyDassou(state, 0, { handCardId: d.id, fieldCardIds: [f1.id, f2.id, f3.id, f4.id] });

    expect(result.ok).toBe(true);
    const [p0, p1] = result.players;
    expect(p0.hand.length).toBe(0);
    expect(p0.field).toEqual([refill]); // refilled to 4 from a 1-card deck -> only 1 available
    expect(p0.house.length).toBe(5);
    expect(allIds(p0.house)).toEqual(expect.arrayContaining([d.id, f1.id, f2.id, f3.id, f4.id]));

    expect(p1.house.length).toBe(0);
    expect(p1.deck.length).toBe(2); // former house cards returned to opponent's own deck
  });

  it('case B: dassou card is in field, 1 attribute card from hand + 3 attribute cards from field', () => {
    const d = dassou();
    const handAttr = cat('handAttr');
    const f2 = cat('f2');
    const f3 = cat('f3');

    const state = {
      players: [
        { deck: [], hand: [handAttr], field: [d, f2, f3], house: [] },
        { deck: [], hand: [], field: [], house: [cat('opp_house_1')] },
      ],
    };

    const result = validateAndApplyDassou(state, 0, { handCardId: handAttr.id, fieldCardIds: [d.id, f2.id, f3.id] });

    // fieldCardIds must total exactly 4 per validation rule
    expect(result.ok).toBe(false);
    expect(result.error).toBe('DASSOU_REQUIRES_4_FIELD_CARDS');
  });

  it('case B with correct 4 field ids (dassou + 3 attribute cards from field)', () => {
    const d = dassou();
    const handAttr = cat('handAttr');
    const f2 = cat('f2');
    const f3 = cat('f3');
    const f4 = cat('f4');

    const state = {
      players: [
        { deck: [], hand: [handAttr], field: [d, f2, f3, f4], house: [] },
        { deck: [], hand: [], field: [], house: [cat('opp_house_1')] },
      ],
    };

    const result = validateAndApplyDassou(state, 0, {
      handCardId: handAttr.id,
      fieldCardIds: [d.id, f2.id, f3.id, f4.id],
    });

    expect(result.ok).toBe(true);
    const [p0, p1] = result.players;
    expect(p0.hand.length).toBe(0);
    expect(p0.field.length).toBe(0); // deck was empty, nothing to refill with
    expect(p0.house.length).toBe(5);
    expect(p1.house.length).toBe(0);
  });

  it('rejects when the dassou card is present in neither the chosen hand nor field cards', () => {
    const handAttr = cat('handAttr');
    const f1 = cat('f1');
    const f2 = cat('f2');
    const f3 = cat('f3');
    const f4 = cat('f4');
    const state = {
      players: [
        { deck: [], hand: [handAttr], field: [f1, f2, f3, f4], house: [] },
        { deck: [], hand: [], field: [], house: [] },
      ],
    };
    const result = validateAndApplyDassou(state, 0, {
      handCardId: handAttr.id,
      fieldCardIds: [f1.id, f2.id, f3.id, f4.id],
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('INVALID_DASSOU_SOURCE');
  });
});

describe('specialActions - きまぐれ', () => {
  it('discards both used cards entirely (never placed in any house), bounces the targeted opponent field card, and refills the actor field', () => {
    const k = kimagure();
    const attr = cat('attr1');
    const refill = cat('refill');
    const oppTarget = cat('opp_target');
    const oppOther = cat('opp_other');

    const state = {
      players: [
        { deck: [refill], hand: [k], field: [attr], house: [] },
        { deck: [], hand: [], field: [oppTarget, oppOther], house: [] },
      ],
    };

    const result = validateAndApplyKimagure(state, 0, {
      handCardId: k.id,
      fieldCardId: attr.id,
      targetOpponentFieldCardId: oppTarget.id,
    });

    expect(result.ok).toBe(true);
    const [p0, p1] = result.players;

    expect(p0.house.length).toBe(0);
    expect(p1.house.length).toBe(0);
    expect(p0.hand.length).toBe(0);
    expect(p0.field).toEqual([refill]);

    // used cards (kimagure + attr1) are gone from the game entirely
    const everyCard = [...p0.deck, ...p0.hand, ...p0.field, ...p0.house, ...p1.deck, ...p1.hand, ...p1.field, ...p1.house];
    expect(everyCard.some((c) => c.id === k.id)).toBe(false);
    expect(everyCard.some((c) => c.id === attr.id)).toBe(false);

    // target field card returned to opponent's own deck
    expect(p1.field).toEqual([oppOther]);
    expect(p1.deck.map((c) => c.id)).toEqual([oppTarget.id]);
  });

  it('rejects when neither hand nor field card is the kimagure card', () => {
    const attr1 = cat('attr1');
    const attr2 = cat('attr2');
    const oppTarget = cat('opp_target');
    const state = {
      players: [
        { deck: [], hand: [attr1], field: [attr2], house: [] },
        { deck: [], hand: [], field: [oppTarget], house: [] },
      ],
    };
    const result = validateAndApplyKimagure(state, 0, {
      handCardId: attr1.id,
      fieldCardId: attr2.id,
      targetOpponentFieldCardId: oppTarget.id,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('INVALID_KIMAGURE_SOURCE');
  });
});
