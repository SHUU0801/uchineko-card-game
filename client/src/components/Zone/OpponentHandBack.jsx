import { Card } from '../Card';

export function OpponentHandBack({ count }) {
  return (
    <div>
      <span className="zone-label">相手の手札（{count}枚）</span>
      <div className="flex gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} card={null} faceDown small />
        ))}
      </div>
    </div>
  );
}
