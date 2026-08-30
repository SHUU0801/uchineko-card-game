import { Card } from '../Card';

export function OpponentHandBack({ count }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">相手の手札（{count}枚）</div>
      <div className="flex gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} card={null} faceDown small />
        ))}
      </div>
    </div>
  );
}
