import { Card } from '../Card';

export function HouseZone({ label, cards }) {
  return (
    <div className="house-zone">
      <span className="zone-label">{label}（{cards.length}匹）</span>
      <div className="flex gap-1 flex-wrap">
        {cards.map((card) => (
          <Card key={card.id} card={card} small />
        ))}
      </div>
    </div>
  );
}
