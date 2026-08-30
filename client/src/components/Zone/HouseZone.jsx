import { Card } from '../Card';

export function HouseZone({ label, cards }) {
  return (
    <div className="bg-black/20 rounded-xl p-2 min-h-[6rem]">
      <div className="text-xs text-slate-400 mb-1">{label}（{cards.length}匹）</div>
      <div className="flex gap-1 flex-wrap">
        {cards.map((card) => (
          <Card key={card.id} card={card} small />
        ))}
      </div>
    </div>
  );
}
