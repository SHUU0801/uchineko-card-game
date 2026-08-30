// 役判定ロジック（純関数・socket.io非依存）。
// カード自体が持つ属性/色情報から動的に判定するため、役の種類をコードで特別扱いしない（§12のデッキ編成機能を見越した設計）。
//
// オールマイティカードの属性は、プレイヤーに事前入力させるのではなく、選ばれたカード集合が
// どの役なら成立し得るかをサーバー側で逆算して自動的に決定する（「役ができそうなら光らせる」UIを支えるため）。

function resolveColor(card) {
  if (card.type === 'cat' || card.type === 'allmighty') return card.color;
  return null; // dassou / kimagure には色が無い
}

function findCardById(cards, id) {
  return cards.find((c) => c.id === id) || null;
}

// ペア役で両方ともオールマイティだった場合のみ使う、表示に影響しないダミー属性値。
const WILDCARD_PLACEHOLDER_ATTRIBUTE = 'gorogoron';

// 必要属性の多重集合(requiredAttributes)に対し、catカードの属性を1つずつ消費できるか確認し、
// 余った枠をオールマイティに割り当てる。割当が一意に決まるため総当たりが不要。
function resolveAttributeMultiset(chosenCards, requiredAttributes) {
  const remaining = [...requiredAttributes];
  const allmightyCards = [];

  for (const card of chosenCards) {
    if (card.type === 'cat') {
      const idx = remaining.indexOf(card.attribute);
      if (idx === -1) return null;
      remaining.splice(idx, 1);
    } else if (card.type === 'allmighty') {
      allmightyCards.push(card);
    } else {
      return null; // dassou / kimagure は通常の役に使えない
    }
  }

  if (remaining.length !== allmightyCards.length) return null;

  const allmightyChoices = {};
  allmightyCards.forEach((card, i) => {
    allmightyChoices[card.id] = remaining[i];
  });
  return allmightyChoices;
}

function resolveSamePairAttribute(chosenCards) {
  if (chosenCards.length !== 2) return null;
  const [a, b] = chosenCards;
  if (!['cat', 'allmighty'].includes(a.type) || !['cat', 'allmighty'].includes(b.type)) return null;

  if (a.type === 'cat' && b.type === 'cat') {
    return a.attribute && b.attribute && a.attribute === b.attribute ? {} : null;
  }
  if (a.type === 'cat' && b.type === 'allmighty') return { [b.id]: a.attribute };
  if (a.type === 'allmighty' && b.type === 'cat') return { [a.id]: b.attribute };
  // 両方オールマイティ：どの属性でも成立するので、表示に使われないダミー値で揃える
  return { [a.id]: WILDCARD_PLACEHOLDER_ATTRIBUTE, [b.id]: WILDCARD_PLACEHOLDER_ATTRIBUTE };
}

// chosenCardsがyakuDefに一致するか判定し、一致すればオールマイティの属性割当も一緒に返す。
function tryMatchYakuDef(yakuDef, chosenCards) {
  if (chosenCards.length !== yakuDef.cardCount) return null;

  if (yakuDef.matchType === 'attributeMultiset') {
    const allmightyChoices = resolveAttributeMultiset(chosenCards, yakuDef.requiredAttributes);
    return allmightyChoices ? { allmightyChoices } : null;
  }

  if (yakuDef.matchType === 'distinctColorSet') {
    const colors = chosenCards.map((c) => resolveColor(c));
    if (colors.some((c) => !c)) return null;
    const distinct = new Set(colors);
    if (distinct.size !== yakuDef.requiredDistinctColors) return null;
    return { allmightyChoices: {} };
  }

  if (yakuDef.matchType === 'samePairAttribute') {
    const allmightyChoices = resolveSamePairAttribute(chosenCards);
    return allmightyChoices ? { allmightyChoices } : null;
  }

  return null;
}

// 手札1枚 + 選択した場札(0〜N-1枚)の組み合わせを、yaku定義に配列順で総当たり照合する。
// 配列順=判定優先順位（名前付き役を先に、generic_pairを最後に置くことでフォールバックとして機能させる）。
function matchChosenCombo({ handCardId, fieldCardIds }, player, yakuDefs) {
  const handCard = findCardById(player.hand, handCardId);
  if (!handCard) return { ok: false, error: 'INVALID_HAND_CARD' };

  const fieldCards = [];
  for (const id of fieldCardIds || []) {
    const card = findCardById(player.field, id);
    if (!card) return { ok: false, error: 'INVALID_FIELD_CARD' };
    fieldCards.push(card);
  }
  if (new Set(fieldCardIds).size !== fieldCardIds.length) {
    return { ok: false, error: 'DUPLICATE_FIELD_CARD' };
  }

  const chosenCards = [handCard, ...fieldCards];

  for (const yakuDef of yakuDefs) {
    const match = tryMatchYakuDef(yakuDef, chosenCards);
    if (match) {
      return { ok: true, yaku: yakuDef, cards: chosenCards, handCard, fieldCards, allmightyChoices: match.allmightyChoices };
    }
  }

  return { ok: false, error: 'NO_MATCHING_YAKU' };
}

// 場札(最大4枚)の全部分集合 x 手札の各カード に対してヒント判定を行う（クライアント表示用・非権威）。
// オールマイティを含む組み合わせも、成立し得る属性割当が一意に決まるため判定に含める。
function getFieldSubsets(fieldCards) {
  const subsets = [];
  const n = fieldCards.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(fieldCards[i]);
    }
    subsets.push(subset);
  }
  return subsets;
}

function findPossibleYaku(player, yakuDefs) {
  const results = [];
  const fieldSubsets = getFieldSubsets(player.field);
  for (const handCard of player.hand) {
    if (handCard.type === 'dassou' || handCard.type === 'kimagure') continue;
    for (const subset of fieldSubsets) {
      const chosenCards = [handCard, ...subset];
      for (const yakuDef of yakuDefs) {
        const match = tryMatchYakuDef(yakuDef, chosenCards);
        if (match) {
          results.push({
            yaku: yakuDef,
            handCardId: handCard.id,
            fieldCardIds: subset.map((c) => c.id),
            allmightyChoices: match.allmightyChoices,
          });
          break;
        }
      }
    }
  }
  return results;
}

module.exports = {
  resolveColor,
  matchChosenCombo,
  findPossibleYaku,
};
