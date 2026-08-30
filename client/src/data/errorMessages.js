const MESSAGES = {
  NO_MATCHING_YAKU: 'その組み合わせでは役が成立しません',
  INVALID_HAND_CARD: '手札の選択が正しくありません',
  INVALID_FIELD_CARD: '場札の選択が正しくありません',
  DUPLICATE_FIELD_CARD: '同じ場札を2回選ぶことはできません',
  NOT_YOUR_TURN: 'あなたの番ではありません',
  WRONG_PHASE: '今はその操作はできません',
  DASSOU_REQUIRES_4_FIELD_CARDS: 'だっそうには場札4枚が必要です',
  DASSOU_FIELD_MUST_BE_ATTRIBUTE_CARDS: 'だっそうの残りは属性カード（ねこ／オールマイティ）である必要があります',
  DASSOU_HAND_MUST_BE_ATTRIBUTE_CARD: 'だっそうの手札側は属性カード（ねこ／オールマイティ）である必要があります',
  INVALID_DASSOU_SOURCE: '選択した中にだっそうカードが含まれていません',
  KIMAGURE_FIELD_MUST_BE_ATTRIBUTE_CARD: 'きまぐれの場札側は属性カード（ねこ／オールマイティ）である必要があります',
  KIMAGURE_HAND_MUST_BE_ATTRIBUTE_CARD: 'きまぐれの手札側は属性カード（ねこ／オールマイティ）である必要があります',
  INVALID_KIMAGURE_SOURCE: '選択した中にきまぐれカードが含まれていません',
  INVALID_TARGET_FIELD_CARD: '相手の場札の選択が正しくありません',
  ALREADY_ACTED: 'このラウンドではすでに行動済みです',
  NO_DRAWN_CARD: '山札が尽きているため引けません',
  SETUP_REQUIRES_4_FIELD_CARDS: '場札は4枚選んでください',
  ALREADY_READY: 'すでに選択済みです',
  ROOM_NOT_FOUND: 'ルームが見つかりませんでした',
  ROOM_FULL: 'このルームは満員です',
  NOT_IN_ROOM: 'ルームに参加していません',
};

export function translateErrorCode(code) {
  return MESSAGES[code] || code;
}
