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
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="text-sm font-bold text-[#c49a3c] mb-4">
          きまぐれ：あいてのばふだを1枚えらんでね
        </h3>
        <div className="flex gap-2 flex-wrap justify-center">
          {view.opponent.field.map((card) => (
            <Card key={card.id} card={card} onClick={() => pickTarget(card.id)} />
          ))}
        </div>
        <button
          className="mt-4 text-xs font-bold text-[#7a6a5a] underline cursor-pointer"
          onClick={() => setPendingKimagureTarget(false)}
        >
          やめる
        </button>
      </div>
    </div>
  );
}
