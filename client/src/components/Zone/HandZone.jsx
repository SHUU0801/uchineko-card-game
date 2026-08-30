import { Card } from '../Card';

export function HandZone({ cards, selectedHandCardId, onSelectHandCard, disabled, glowIds = [], newCardIds = null, flyFromId = null }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">自分の手札（{cards.length}枚）</div>
      <div className="flex gap-2 flex-wrap">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            selected={selectedHandCardId === card.id}
            disabled={disabled}
            glow={glowIds.includes(card.id)}
            flyFromId={newCardIds && newCardIds.has(card.id) ? flyFromId : null}
            onClick={() => onSelectHandCard(card.id)}
          />
        ))}
      </div>
    </div>
  );
}
