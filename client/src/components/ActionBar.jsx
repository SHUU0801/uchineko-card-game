import { useGameStore } from '../store/gameStore';
import { socket } from './SocketManager';

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((x) => sb.has(x));
}

export function ActionBar() {
  const view = useGameStore((s) => s.view);
  const myIndex = useGameStore((s) => s.myIndex);
  const selection = useGameStore((s) => s.selection);
  const setPendingKimagureTarget = useGameStore((s) => s.setPendingKimagureTarget);
  const clearSelection = useGameStore((s) => s.clearSelection);

  const isMyTurn = view && view.phase === 'playing' && view.currentTurnPlayerIndex === myIndex;

  if (!view) return null;

  const selectedHandCard = view.me.hand.find((c) => c.id === selection.handCardId) || null;
  const selectedFieldCards = view.me.field.filter((c) => selection.fieldCardIds.includes(c.id));
  const selectedCards = [selectedHandCard, ...selectedFieldCards].filter(Boolean);

  const possibleYaku = view.me.possibleYaku || [];
  const matchesAHint =
    !!selection.handCardId &&
    possibleYaku.some((p) => p.handCardId === selection.handCardId && sameSet(p.fieldCardIds, selection.fieldCardIds));

  const canAttemptYaku = isMyTurn && matchesAHint;

  const canDassou =
    isMyTurn &&
    selection.handCardId &&
    selection.fieldCardIds.length === 4 &&
    selectedCards.some((c) => c.type === 'dassou');

  const canKimagure =
    isMyTurn &&
    selection.handCardId &&
    selection.fieldCardIds.length === 1 &&
    selectedCards.some((c) => c.type === 'kimagure');

  const attemptYaku = () => {
    socket.emit('attempt_yaku', {
      handCardId: selection.handCardId,
      fieldCardIds: selection.fieldCardIds,
    });
  };

  const activateDassou = () => {
    socket.emit('activate_dassou', {
      handCardId: selection.handCardId,
      fieldCardIds: selection.fieldCardIds,
    });
  };

  const openKimagurePicker = () => setPendingKimagureTarget(true);

  const pass = () => {
    socket.emit('pass_turn', {});
    clearSelection();
  };

  return (
    <div className="game-panel p-3 flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold mr-1" style={{ color: '#8b7355' }}>
        {isMyTurn ? 'あなたの番です' : '相手の番です'}
      </span>
      <button onClick={attemptYaku} disabled={!canAttemptYaku} className="game-btn game-btn-primary text-xs">
        役を成立させる
      </button>
      <button onClick={activateDassou} disabled={!canDassou} className="game-btn game-btn-danger text-xs">
        だっそう発動
      </button>
      <button onClick={openKimagurePicker} disabled={!canKimagure} className="game-btn game-btn-warn text-xs">
        きまぐれ発動
      </button>
      <button onClick={pass} disabled={!isMyTurn} className="game-btn game-btn-neutral text-xs">
        パス
      </button>
      <button
        onClick={clearSelection}
        className="text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
        style={{ color: '#8b7355', border: '1px solid #5c3d2e', background: 'transparent' }}
      >
        選択クリア
      </button>
    </div>
  );
}
