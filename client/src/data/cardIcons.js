// カードアイコン素材: game-icons.net（CC BY 3.0 / Lorc, Delapouite）
// https://game-icons.net — クレジット表記は RulesButton の「あそびかた」末尾に記載。
import gorogoron from '../assets/icons/gorogoron.svg';
import daran from '../assets/icons/daran.svg';
import peropero from '../assets/icons/peropero.svg';
import wakuwaku from '../assets/icons/wakuwaku.svg';
import punipuni from '../assets/icons/punipuni.svg';
import momimomi from '../assets/icons/momimomi.svg';
import fuwaa from '../assets/icons/fuwaa.svg';
import suyasuya from '../assets/icons/suyasuya.svg';
import mogumogu from '../assets/icons/mogumogu.svg';
import nobinobi from '../assets/icons/nobinobi.svg';
import chokon from '../assets/icons/chokon.svg';
import suppori from '../assets/icons/suppori.svg';
import allmighty from '../assets/icons/allmighty.svg';
import dassou from '../assets/icons/dassou.svg';
import kimagure from '../assets/icons/kimagure.svg';

const ATTRIBUTE_ICON = {
  gorogoron,
  daran,
  peropero,
  wakuwaku,
  punipuni,
  momimomi,
  fuwaa,
  suyasuya,
  mogumogu,
  nobinobi,
  chokon,
  suppori,
};

const SPECIAL_ICON = { allmighty, dassou, kimagure };

export function cardIcon(card) {
  if (!card) return null;
  if (card.type === 'cat') return ATTRIBUTE_ICON[card.attribute] || null;
  return SPECIAL_ICON[card.type] || null;
}
