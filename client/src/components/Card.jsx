import { useLayoutEffect, useRef } from 'react';
import { cardLabel, colorToBgClass, cardEmoji } from '../data/masterData';

export function Card({ card, faceDown = false, selected = false, disabled = false, onClick, small = false, glow = false, flyFromId = null }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!flyFromId || !ref.current) return;
    const source = document.getElementById(flyFromId);
    if (!source) return;
    const sourceRect = source.getBoundingClientRect();
    const targetRect = ref.current.getBoundingClientRect();
    const dx = sourceRect.left + sourceRect.width / 2 - (targetRect.left + targetRect.width / 2);
    const dy = sourceRect.top + sourceRect.height / 2 - (targetRect.top + targetRect.height / 2);
    ref.current.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(0.55)`, opacity: 0.3 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      ],
      { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sizeClass = small ? 'w-14 h-20 text-[10px]' : 'w-20 h-28 text-xs';
  const emojiSize = small ? 'text-lg' : 'text-2xl';

  if (faceDown || !card) {
    return (
      <div className={`${sizeClass} rounded-lg bg-[#2a211a] border border-[#4a3a2e] flex items-center justify-center select-none`}>
        <span className="text-lg opacity-30">🐾</span>
      </div>
    );
  }

  const isSpecial = card.type === 'dassou' || card.type === 'kimagure';
  const isAllmighty = card.type === 'allmighty';

  let bgClass = '';
  if (isSpecial) bgClass = 'bg-[#2a211a]';
  else if (isAllmighty) bgClass = 'bg-[#c49a3c]';
  else bgClass = colorToBgClass(card.color);

  let borderClass = 'border-[#4a3a2e]';
  if (selected) borderClass = 'border-[#f5d76e]';
  else if (glow) borderClass = 'border-[#6fcf73]';

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={[
        sizeClass,
        flyFromId ? '' : 'animate-card-pop',
        'rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 font-bold text-white transition-all',
        bgClass,
        borderClass,
        selected ? '-translate-y-2 shadow-[0_0_0_2px_rgba(245,215,110,0.4)]' : '',
        glow && !selected ? 'card-glow' : '',
        onClick && !disabled ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default',
        disabled ? 'opacity-40' : '',
      ].filter(Boolean).join(' ')}
    >
      <span className={emojiSize}>{cardEmoji(card)}</span>
      <span className={`text-center leading-tight px-1 font-bold ${isAllmighty ? 'text-[#1a1210]' : ''}`}>
        {cardLabel(card)}
      </span>
    </button>
  );
}
