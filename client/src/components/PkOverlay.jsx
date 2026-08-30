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

  const attempt = () => socket.emit('pk_action', { fieldCardIds: selection.fieldCardIds });
  const pass = () => { socket.emit('pk_action', { pass: true }); clearSelection(); };

  return (
    <div className="game-panel-gold p-4 space-y-3">
      <h3 className="text-sm font-bold text-center text-[#c49a3c]">サドンデス</h3>
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs font-bold text-[#7a6a5a]">ひいたカード:</span>
        {myActed ? <span className="text-xs font-bold text-[#4a3a2e]">こうどうずみ</span> : <Card card={myDrawnCard} />}
      </div>
      <div className="text-xs text-center font-bold text-[#7a6a5a]">
        じぶん: {myActed ? '✓' : '…'} ／ あいて: {opponentActed ? '✓' : '…'}
      </div>
      {!myActed && (
        <div className="flex justify-center gap-2">
          <button onClick={attempt} disabled={!matchesAHint} className="game-btn game-btn-primary text-sm py-2 px-4">
            やくをためす
          </button>
          <button onClick={pass} className="game-btn game-btn-neutral text-sm py-2 px-4">
            パス
          </button>
        </div>
      )}
    </div>
  );
}
