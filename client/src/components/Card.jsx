import { cardLabel, colorToBgClass, cardEmoji } from '../data/masterData';

export function Card({ card, faceDown = false, selected = false, disabled = false, onClick, small = false, glow = false }) {
  const sizeClass = small ? 'w-14 h-20 text-[10px]' : 'w-20 h-28 text-xs';

  if (faceDown || !card) {
    return (
      <div
        className={`${sizeClass} rounded-lg border-2 border-slate-600 bg-slate-800 flex items-center justify-center text-slate-500 select-none`}
      >
        🐾
      </div>
    );
  }

  const isSpecial = card.type === 'dassou' || card.type === 'kimagure';
  const bgClass = isSpecial ? 'bg-slate-700' : colorToBgClass(card.color);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={[
        sizeClass,
        'animate-card-pop',
        'rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 font-bold text-white shadow transition-transform',
        bgClass,
        selected
          ? 'border-yellow-300 -translate-y-2 ring-2 ring-yellow-300'
          : glow
            ? 'border-emerald-300 ring-2 ring-emerald-300 animate-pulse'
            : 'border-white/30',
        onClick && !disabled ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default',
        disabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      <span className={small ? 'text-xl' : 'text-2xl'}>{cardEmoji(card)}</span>
      <span className="text-center leading-tight px-1">{cardLabel(card)}</span>
    </button>
  );
}
