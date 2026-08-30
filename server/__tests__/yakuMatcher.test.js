import { describe, it, expect } from 'vitest';
const path = require('path');
const { matchChosenCombo } = require('../gameEngine/yakuMatcher');

const yakuDefs = require(path.join(__dirname, '../../shared/data/yaku.json'));
const attributes = require(path.join(__dirname, '../../shared/data/attributes.json'));

const colorOf = (attrId) => attributes.find((a) => a.id === attrId).color;

let uid = 0;
function catCard(attributeId) {
  uid += 1;
  return { id: `cat_${attributeId}_${uid}`, type: 'cat', attribute: attributeId, color: colorOf(attributeId) };
}
function allmightyCard(color) {
  uid += 1;
  return { id: `allmighty_${color}_${uid}`, type: 'allmighty', color };
}

function makePlayer(handCards, fieldCards) {
  return { hand: handCards, field: fieldCards, house: [], deck: [] };
}

describe('yakuMatcher - named yaku (arualu + kyunkyun, excluding 大集会)', () => {
  const namedYaku = yakuDefs.filter((y) => y.matchType === 'attributeMultiset');

  namedYaku.forEach((yaku) => {
    it(`matches ${yaku.name} (${yaku.id})`, () => {
      const cards = yaku.requiredAttributes.map((attr) => catCard(attr));
      const handCard = cards[0];
      const fieldCards = cards.slice(1);
      const player = makePlayer([handCard], fieldCards);

      const result = matchChosenCombo(
        { handCardId: handCard.id, fieldCardIds: fieldCards.map((c) => c.id) },
        player,
        yakuDefs
      );

      expect(result.ok).toBe(true);
      expect(result.yaku.id).toBe(yaku.id);
    });
  });
});

describe('yakuMatcher - generic pair fallback', () => {
  it('matches a same-attribute pair not covered by a named yaku', () => {
    const h = catCard('nobinobi');
    const f = catCard('nobinobi');
    const player = makePlayer([h], [f]);

    const result = matchChosenCombo({ handCardId: h.id, fieldCardIds: [f.id] }, player, yakuDefs);

    expect(result.ok).toBe(true);
    expect(result.yaku.id).toBe('generic_pair');
  });

  it('does not fall back to pair when attributes differ and no yaku matches', () => {
    const h = catCard('nobinobi');
    const f = catCard('chokon'); // nobinobi+chokon is not a defined 2-card yaku
    const player = makePlayer([h], [f]);

    const result = matchChosenCombo({ handCardId: h.id, fieldCardIds: [f.id] }, player, yakuDefs);

    expect(result.ok).toBe(false);
  });
});

describe('yakuMatcher - allmighty wildcard', () => {
  it('a single allmighty card substitutes into a named yaku (attribute auto-resolved server-side)', () => {
    const h = catCard('gorogoron');
    const f = allmightyCard('red');
    const player = makePlayer([h], [f]);

    const result = matchChosenCombo({ handCardId: h.id, fieldCardIds: [f.id] }, player, yakuDefs);

    expect(result.ok).toBe(true);
    expect(result.yaku.id).toBe('hesoten_biyori');
    expect(result.allmightyChoices[f.id]).toBe('daran');
  });

  it('unlimited allmighty use: two allmighty cards can fill a 2-slot yaku with no cat cards involved', () => {
    // 属性割当はサーバーが自動で逆算するため、手掛かりが全く無い(両方オールマイティ)場合は
    // yaku.json の優先順位で最初に一致する役(先頭のhesoten_biyori)に確定する。
    const h = allmightyCard('blue');
    const f = allmightyCard('green');
    const player = makePlayer([h], [f]);

    const result = matchChosenCombo({ handCardId: h.id, fieldCardIds: [f.id] }, player, yakuDefs);

    expect(result.ok).toBe(true);
    expect(result.yaku.id).toBe('hesoten_biyori');
  });
});

describe('yakuMatcher - 大集会 (distinct color set)', () => {
  it('matches with 5 distinct colors from plain cat cards', () => {
    const h = catCard('gorogoron'); // red
    const field = [catCard('peropero'), catCard('punipuni'), catCard('fuwaa'), catCard('mogumogu')]; // blue, green, purple, orange
    const player = makePlayer([h], field);

    const result = matchChosenCombo(
      { handCardId: h.id, fieldCardIds: field.map((c) => c.id) },
      player,
      yakuDefs
    );

    expect(result.ok).toBe(true);
    expect(result.yaku.id).toBe('dai_shuukai');
  });

  it('matches with an allmighty card contributing its own fixed color regardless of chosen attribute', () => {
    const h = catCard('gorogoron'); // red
    const wildcard = allmightyCard('navy'); // fixed color navy
    const field = [catCard('peropero'), catCard('punipuni'), catCard('fuwaa'), wildcard]; // blue, green, purple, navy
    const player = makePlayer([h], field);

    // 大集会は色ベースの判定のため、オールマイティの属性は関係ない（渡す必要すら無い）
    const result = matchChosenCombo(
      { handCardId: h.id, fieldCardIds: field.map((c) => c.id) },
      player,
      yakuDefs
    );

    expect(result.ok).toBe(true);
    expect(result.yaku.id).toBe('dai_shuukai');
  });

  it('fails with only 4 distinct colors', () => {
    const h = catCard('gorogoron'); // red
    const field = [catCard('daran'), catCard('punipuni'), catCard('fuwaa'), catCard('mogumogu')]; // red, green, purple, orange (only 4 distinct)
    const player = makePlayer([h], field);

    const result = matchChosenCombo(
      { handCardId: h.id, fieldCardIds: field.map((c) => c.id) },
      player,
      yakuDefs
    );

    expect(result.ok).toBe(false);
  });
});

describe('yakuMatcher - zone rules', () => {
  it('rejects a field card id that is not actually in the player\'s field', () => {
    const h = catCard('gorogoron');
    const notOnField = catCard('daran');
    const player = makePlayer([h], []);

    const result = matchChosenCombo(
      { handCardId: h.id, fieldCardIds: [notOnField.id] },
      player,
      yakuDefs
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe('INVALID_FIELD_CARD');
  });

  it('rejects duplicate field card ids', () => {
    const h = catCard('gorogoron');
    const f = catCard('daran');
    const player = makePlayer([h], [f]);

    const result = matchChosenCombo(
      { handCardId: h.id, fieldCardIds: [f.id, f.id] },
      player,
      yakuDefs
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe('DUPLICATE_FIELD_CARD');
  });
});
