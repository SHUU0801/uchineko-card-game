const path = require('path');
const attributes = require(path.join(__dirname, '../../shared/data/attributes.json'));
const cards = require(path.join(__dirname, '../../shared/data/cards.json'));
const deckComposition = require(path.join(__dirname, '../../shared/data/deckComposition.json'));

const attributeById = new Map(attributes.map((a) => [a.id, a]));

// すっぽり(lightblue)は表示専用の独立色。オールマイティの基本6色(red/blue/green/purple/orange/navy)には含まれない。
const ALLMIGHTY_COLORS = ['red', 'blue', 'green', 'purple', 'orange', 'navy'];

function resolveCatColor(attributeId) {
  const attr = attributeById.get(attributeId);
  if (!attr) throw new Error(`Unknown attribute id: ${attributeId}`);
  return attr.color;
}

function assertComposition() {
  const catCount = cards.catCards.length;
  const allmightyCount = cards.allmightyCards.length;
  const dassouCount = cards.specialCards.filter((c) => c.type === 'dassou').length;
  const kimagureCount = cards.specialCards.filter((c) => c.type === 'kimagure').length;
  const total = catCount + allmightyCount + dassouCount + kimagureCount;

  if (catCount !== deckComposition.catCopiesPerAttribute * attributes.length) {
    throw new Error(`cards.json catCards count (${catCount}) does not match deckComposition (12 attributes x ${deckComposition.catCopiesPerAttribute})`);
  }
  if (allmightyCount !== deckComposition.allmightyCount) {
    throw new Error(`cards.json allmightyCards count (${allmightyCount}) does not match deckComposition.allmightyCount (${deckComposition.allmightyCount})`);
  }
  if (dassouCount !== deckComposition.dassouCount || kimagureCount !== deckComposition.kimagureCount) {
    throw new Error('cards.json specialCards counts do not match deckComposition');
  }
  if (total !== deckComposition.totalCards) {
    throw new Error(`Total card count (${total}) does not match deckComposition.totalCards (${deckComposition.totalCards})`);
  }
  const allmightyColors = cards.allmightyCards.map((c) => c.color).sort();
  if (JSON.stringify(allmightyColors) !== JSON.stringify([...ALLMIGHTY_COLORS].sort())) {
    throw new Error('cards.json allmightyCards colors do not match the fixed 6 base colors');
  }
}

assertComposition();

function buildDeck() {
  const catCards = cards.catCards.map((c) => ({
    id: c.id,
    type: 'cat',
    attribute: c.attribute,
    color: resolveCatColor(c.attribute),
  }));
  const allmightyCards = cards.allmightyCards.map((c) => ({
    id: c.id,
    type: 'allmighty',
    color: c.color,
  }));
  const specialCards = cards.specialCards.map((c) => ({ id: c.id, type: c.type }));

  return [...catCards, ...allmightyCards, ...specialCards];
}

// Fisher-Yates。rngは[0,1)を返す注入可能な関数（テストで決定的にするため）。
function shuffle(deck, rng = Math.random) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 山札の末尾を「一番上」として扱う（pop=ドロー、シャッフル後は向きに意味がないため）。
function drawOne(deck) {
  if (deck.length === 0) return { deck, card: null };
  const nextDeck = [...deck];
  const card = nextDeck.pop();
  return { deck: nextDeck, card };
}

function refillTo(field, deck, targetSize = 4) {
  let nextField = [...field];
  let nextDeck = [...deck];
  while (nextField.length < targetSize && nextDeck.length > 0) {
    const { deck: d, card } = drawOne(nextDeck);
    nextDeck = d;
    nextField = [...nextField, card];
  }
  return { field: nextField, deck: nextDeck };
}

module.exports = {
  buildDeck,
  shuffle,
  drawOne,
  refillTo,
  resolveCatColor,
  ALLMIGHTY_COLORS,
};
