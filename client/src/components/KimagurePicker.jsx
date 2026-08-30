import { Card } from './Card';
import { useGameStore } from '../store/gameStore';
import { socket } from './SocketManager';

export function KimagurePicker() {
  const pendingKimagureTarget = useGameStore((s) => s.pendingKimagureTarget);
  const view = useGameStore((s) => s.view);
  const selection = useGameStore((s) => s.selection);
  const setPendingKimagureTarget = useGameStore((s) => s.setPendingKimagureTarget);
  const clearSelection = useGameStore((s) => s.clearSelection);

  if (!pendingKimagureTarget || !view) return null;

  const pickTarget = (targetOpponentFieldCardId) => {
    socket.emit('activate_kimagure', {
      handCardId: selection.handCardId,
      fieldCardId: selection.fieldCardIds[0],
      targetOpponentFieldCardId,
    });
    setPendingKimagureTarget(false);
    clearSelection();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-4 max-w-md w-full">
        <h3 className="text-sm font-bold mb-3">きまぐれ：相手の場札を1枚選んで戻させます</h3>
        <div className="flex gap-2 flex-wrap justify-center">
          {view.opponent.field.map((card) => (
            <Card key={card.id} card={card} onClick={() => pickTarget(card.id)} />
          ))}
        </div>
        <button
          className="mt-3 text-xs text-slate-400 underline"
          onClick={() => setPendingKimagureTarget(false)}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
