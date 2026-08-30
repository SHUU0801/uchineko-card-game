const { shuffle, refillTo } = require('./deck');

function removeById(cards, id) {
  const idx = cards.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const card = cards[idx];
  const rest = [...cards.slice(0, idx), ...cards.slice(idx + 1)];
  return { card, rest };
}

function isAttributeCard(card) {
  return card.type === 'cat' || card.type === 'allmighty';
}

function clonePlayers(gameState) {
  return gameState.players.map((p) => ({
    deck: [...p.deck],
    hand: [...p.hand],
    field: [...p.field],
    house: [...p.house],
  }));
}

// だっそう：発動コスト＝だっそうカード1枚＋属性カード4枚（計5枚。手札1＋場4の原則）。
// だっそうカードが手札にあるか場札にあるかで内訳が変わるが、正味の消費（手札1・場4）は共通。
function validateAndApplyDassou(gameState, playerIndex, { handCardId, fieldCardIds }) {
  if (!Array.isArray(fieldCardIds) || fieldCardIds.length !== 4) {
    return { ok: false, error: 'DASSOU_REQUIRES_4_FIELD_CARDS' };
  }
  if (new Set(fieldCardIds).size !== 4) {
    return { ok: false, error: 'DUPLICATE_FIELD_CARD' };
  }

  const players = clonePlayers(gameState);
  const player = players[playerIndex];
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const opponent = players[opponentIndex];

  const handResult = removeById(player.hand, handCardId);
  if (!handResult) return { ok: false, error: 'INVALID_HAND_CARD' };

  let fieldRemoved = [];
  let remainingField = player.field;
  for (const id of fieldCardIds) {
    const res = removeById(remainingField, id);
    if (!res) return { ok: false, error: 'INVALID_FIELD_CARD' };
    fieldRemoved.push(res.card);
    remainingField = res.rest;
  }

  const dassouInHand = handResult.card.type === 'dassou';
  const dassouInField = fieldRemoved.filter((c) => c.type === 'dassou').length === 1;

  if (dassouInHand && !dassouInField) {
    // ケースA：だっそうは手札から。場4枚は全て属性カードでなければならない。
    if (!fieldRemoved.every(isAttributeCard)) {
      return { ok: false, error: 'DASSOU_FIELD_MUST_BE_ATTRIBUTE_CARDS' };
    }
  } else if (!dassouInHand && dassouInField) {
    // ケースB：だっそうは場札から。手札のカードは属性カードでなければならない。残り場3枚も属性カード。
    if (!isAttributeCard(handResult.card)) {
      return { ok: false, error: 'DASSOU_HAND_MUST_BE_ATTRIBUTE_CARD' };
    }
    if (!fieldRemoved.filter((c) => c.type !== 'dassou').every(isAttributeCard)) {
      return { ok: false, error: 'DASSOU_FIELD_MUST_BE_ATTRIBUTE_CARDS' };
    }
  } else {
    return { ok: false, error: 'INVALID_DASSOU_SOURCE' };
  }

  const movedToHouse = [handResult.card, ...fieldRemoved];
  player.hand = handResult.rest;
  player.field = remainingField;
  player.house = [...player.house, ...movedToHouse];

  // 相手のハウスを空にして相手自身の山札へ戻し、シャッフルさせる。
  const opponentDeckWithHouse = [...opponent.deck, ...opponent.house];
  opponent.house = [];
  opponent.deck = shuffle(opponentDeckWithHouse);

  const refilled = refillTo(player.field, player.deck, 4);
  player.field = refilled.field;
  player.deck = refilled.deck;

  return { ok: true, players };
}

// きまぐれ：発動コスト＝きまぐれカード1枚＋属性カード1枚（計2枚。手札1＋場1の原則）。
// 使用した2枚はハウスに置かず捨て札（ゲームから除外）。相手の場札を1枚指定して山札へ戻させ、シャッフルさせる。
function validateAndApplyKimagure(gameState, playerIndex, { handCardId, fieldCardId, targetOpponentFieldCardId }) {
  const players = clonePlayers(gameState);
  const player = players[playerIndex];
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const opponent = players[opponentIndex];

  const handResult = removeById(player.hand, handCardId);
  if (!handResult) return { ok: false, error: 'INVALID_HAND_CARD' };

  const fieldResult = removeById(player.field, fieldCardId);
  if (!fieldResult) return { ok: false, error: 'INVALID_FIELD_CARD' };

  const kimagureInHand = handResult.card.type === 'kimagure';
  const kimagureInField = fieldResult.card.type === 'kimagure';

  if (kimagureInHand && !kimagureInField) {
    if (!isAttributeCard(fieldResult.card)) {
      return { ok: false, error: 'KIMAGURE_FIELD_MUST_BE_ATTRIBUTE_CARD' };
    }
  } else if (!kimagureInHand && kimagureInField) {
    if (!isAttributeCard(handResult.card)) {
      return { ok: false, error: 'KIMAGURE_HAND_MUST_BE_ATTRIBUTE_CARD' };
    }
  } else {
    return { ok: false, error: 'INVALID_KIMAGURE_SOURCE' };
  }

  const targetResult = removeById(opponent.field, targetOpponentFieldCardId);
  if (!targetResult) return { ok: false, error: 'INVALID_TARGET_FIELD_CARD' };

  // 使用した2枚は捨て札（どちらのhouseにも入らない）。
  player.hand = handResult.rest;
  player.field = fieldResult.rest;

  opponent.field = targetResult.rest;
  opponent.deck = shuffle([...opponent.deck, targetResult.card]);

  const refilled = refillTo(player.field, player.deck, 4);
  player.field = refilled.field;
  player.deck = refilled.deck;

  return { ok: true, players };
}

module.exports = {
  validateAndApplyDassou,
  validateAndApplyKimagure,
};
