import { Card } from '../Card';

export function FieldZone({ label, cards, selectable = false, selectedIds = [], onToggle, disabled = false, glowIds = [] }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}（{cards.length}枚）</div>
      <div className="flex gap-2 flex-wrap">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            selected={selectedIds.includes(card.id)}
            disabled={disabled}
            glow={glowIds.includes(card.id)}
            onClick={selectable ? () => onToggle(card.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
