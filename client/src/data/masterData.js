import attributes from '../../../shared/data/attributes.json';
import cardsCatalog from '../../../shared/data/cards.json';
import yakuDefs from '../../../shared/data/yaku.json';

export { attributes, cardsCatalog, yakuDefs };

export const attributeById = new Map(attributes.map((a) => [a.id, a]));

export function attributeName(attributeId) {
  const attr = attributeById.get(attributeId);
  return attr ? attr.name : attributeId;
}

// tailwind.config.js の theme.extend.colors.cat.* と対応させる。
// すっぽり(lightblue)はオールマイティの基本6色とは独立した表示専用色。
const COLOR_TO_CLASS = {
  red: 'bg-cat-red',
  blue: 'bg-cat-blue',
  green: 'bg-cat-green',
  purple: 'bg-cat-purple',
  orange: 'bg-cat-orange',
  navy: 'bg-cat-navy',
  lightblue: 'bg-cat-lightblue',
};

export function colorToBgClass(color) {
  return COLOR_TO_CLASS[color] || 'bg-gray-500';
}

export function cardLabel(card) {
  if (!card) return '';
  if (card.type === 'cat') return attributeName(card.attribute);
  if (card.type === 'allmighty') return 'オールマイティ';
  if (card.type === 'dassou') return 'だっそう';
  if (card.type === 'kimagure') return 'きまぐれ';
  return card.type;
}

export const ALLMIGHTY_COLORS = ['red', 'blue', 'green', 'purple', 'orange', 'navy'];

// 文字だけだと属性の見分けがつきにくいため、属性ごとに絵文字アイコンを添える（軽量な「イラスト」代替）。
const ATTRIBUTE_EMOJI = {
  gorogoron: '😽',
  daran: '😪',
  peropero: '👅',
  wakuwaku: '✨',
  punipuni: '🐾',
  momimomi: '🤲',
  fuwaa: '🥱',
  suyasuya: '💤',
  mogumogu: '🍖',
  nobinobi: '🙆',
  chokon: '🐈',
  suppori: '📦',
};

export function attributeEmoji(attributeId) {
  return ATTRIBUTE_EMOJI[attributeId] || '🐱';
}

export function cardEmoji(card) {
  if (!card) return '🐾';
  if (card.type === 'cat') return attributeEmoji(card.attribute);
  if (card.type === 'allmighty') return '⭐';
  if (card.type === 'dassou') return '💨';
  if (card.type === 'kimagure') return '🎲';
  return '🐱';
}
