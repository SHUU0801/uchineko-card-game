import { useLayoutEffect, useRef } from 'react';
import { cardLabel, colorToBgClass, cardEmoji } from '../data/masterData';

const COLOR_TO_GRADIENT = {
  red: 'from-red-700 to-red-900',
  blue: 'from-blue-600 to-blue-900',
  green: 'from-green-600 to-green-900',
  purple: 'from-purple-600 to-purple-900',
  orange: 'from-orange-600 to-orange-900',
  navy: 'from-blue-800 to-blue-950',
  lightblue: 'from-sky-400 to-sky-700',
};

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

  if (faceDown || !card) {
    const sz = small ? 'w-14 h-20' : 'w-20 h-28';
    return (
      <div
        className={`${sz} rounded-lg flex items-center justify-center select-none`}
        style={{
          background: 'linear-gradient(135deg, #3d2a1e 0%, #2d1b12 100%)',
          border: '2px solid #5c3d2e',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,164,74,0.1)',
        }}
      >
        <span className="text-lg opacity-40">🐾</span>
      </div>
    );
  }

  const isSpecial = card.type === 'dassou' || card.type === 'kimagure';
  const isAllmighty = card.type === 'allmighty';
  const gradientClass = isSpecial ? '' : isAllmighty ? '' : (COLOR_TO_GRADIENT[card.color] || '');

  let innerBg;
  if (isSpecial) {
    innerBg = 'linear-gradient(135deg, #3d2a1e 0%, #2d1b12 100%)';
  } else if (isAllmighty) {
    innerBg = 'linear-gradient(135deg, #d4a44a 0%, #8b6914 50%, #d4a44a 100%)';
  } else {
    innerBg = undefined;
  }

  const sizeOuter = small ? 'w-14 h-20' : 'w-20 h-28';
  const emojiSize = small ? 'text-lg' : 'text-2xl';
  const labelSize = small ? 'text-[8px]' : 'text-[10px]';

  let borderColor = 'rgba(92, 61, 46, 0.8)';
  let ringStyle = {};
  if (selected) {
    borderColor = '#f0d68a';
    ringStyle = { boxShadow: '0 0 0 3px rgba(240, 214, 138, 0.5), 0 4px 12px rgba(0,0,0,0.4)' };
  } else if (glow) {
    borderColor = '#4ade80';
    ringStyle = {};
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={[
        sizeOuter,
        flyFromId ? '' : 'animate-card-pop',
        'rounded-lg flex flex-col items-center justify-center gap-0.5 font-bold text-white transition-all',
        gradientClass ? `bg-gradient-to-b ${gradientClass}` : '',
        selected ? '-translate-y-2' : '',
        glow && !selected ? 'card-glow' : '',
        onClick && !disabled ? 'cursor-pointer hover:-translate-y-1 hover:brightness-110' : 'cursor-default',
        disabled ? 'opacity-40' : '',
      ].filter(Boolean).join(' ')}
      style={{
        border: `2px solid ${borderColor}`,
        ...(innerBg ? { background: innerBg } : {}),
        boxShadow: `${ringStyle.boxShadow || ''}, inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 8px rgba(0,0,0,0.5)`.replace(/^, /, ''),
        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
      }}
    >
      <span className={emojiSize} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>{cardEmoji(card)}</span>
      <span className={`${labelSize} text-center leading-tight px-1 font-bold`} style={{ color: isAllmighty ? '#1a0f0a' : '#f5e6d3' }}>
        {cardLabel(card)}
      </span>
    </button>
  );
}
