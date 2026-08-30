import { useGameStore } from '../store/gameStore';
import { socket } from './SocketManager';
import { Card } from './Card';

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((x) => sb.has(x));
}

export function PkOverlay() {
  const view = useGameStore((s) => s.view);
  const selection = useGameStore((s) => s.selection);
  const clearSelection = useGameStore((s) => s.clearSelection);

  if (!view || !view.pk) return null;
  const { myDrawnCard, myActed, opponentActed, possibleYaku } = view.pk;

  const matchesAHint = (possibleYaku || []).some((p) => sameSet(p.fieldCardIds, selection.fieldCardIds));

  const attempt = () => {
    socket.emit('pk_action', { fieldCardIds: selection.fieldCardIds });
  };

  const pass = () => {
    socket.emit('pk_action', { pass: true });
    clearSelection();
  };

  return (
    <div className="game-panel-gold p-4 space-y-3">
      <h3 className="text-sm font-black text-center" style={{ color: '#f0d68a' }}>サドンデス（PK）</h3>
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs font-bold" style={{ color: '#8b7355' }}>今回引いたカード:</span>
        {myActed ? <span className="text-xs font-bold" style={{ color: '#5c3d2e' }}>行動済み</span> : <Card card={myDrawnCard} />}
      </div>
      <div className="text-xs text-center font-bold" style={{ color: '#8b7355' }}>
        自分: {myActed ? '完了' : '選択中'} ／ 相手: {opponentActed ? '完了' : '選択中'}
      </div>
      {!myActed && (
        <div className="flex justify-center gap-2">
          <button onClick={attempt} disabled={!matchesAHint} className="game-btn game-btn-primary text-xs">
            役を試す
          </button>
          <button onClick={pass} className="game-btn game-btn-neutral text-xs">
            パス
          </button>
        </div>
      )}
    </div>
  );
}
