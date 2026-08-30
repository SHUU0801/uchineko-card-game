import { Card } from '../Card';

export function FieldZone({ label, cards, selectable = false, selectedIds = [], onToggle, disabled = false, glowIds = [], newCardIds = null, flyFromId = null }) {
  return (
    <div>
      <span className="zone-label">{label}（{cards.length}枚）</span>
      <div className="flex gap-2 flex-wrap">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            selected={selectedIds.includes(card.id)}
            disabled={disabled}
            glow={glowIds.includes(card.id)}
            flyFromId={newCardIds && newCardIds.has(card.id) ? flyFromId : null}
            onClick={selectable ? () => onToggle(card.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
