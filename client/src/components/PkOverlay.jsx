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

  // 選択中の場札の組み合わせが、サーバー提示のヒント（オールマイティの属性は自動解決済み）に一致するか
  const matchesAHint = (possibleYaku || []).some((p) => sameSet(p.fieldCardIds, selection.fieldCardIds));

  const attempt = () => {
    socket.emit('pk_action', { fieldCardIds: selection.fieldCardIds });
  };

  const pass = () => {
    socket.emit('pk_action', { pass: true });
    clearSelection();
  };

  return (
    <div className="bg-purple-950/60 border border-purple-500 rounded-xl p-3 space-y-3">
      <h3 className="text-sm font-bold text-center">サドンデス（PK）</h3>
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs text-slate-400">今回引いたカード:</span>
        {myActed ? <span className="text-xs text-slate-500">行動済み</span> : <Card card={myDrawnCard} />}
      </div>
      <div className="text-xs text-center text-slate-400">
        自分: {myActed ? '完了' : '選択中'} ／ 相手: {opponentActed ? '完了' : '選択中'}
      </div>
      {!myActed && (
        <div className="flex justify-center gap-2">
          <button
            onClick={attempt}
            disabled={!matchesAHint}
            className="px-3 py-2 rounded-lg bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-sm font-bold"
          >
            役を試す
          </button>
          <button onClick={pass} className="px-3 py-2 rounded-lg bg-slate-600 text-sm font-bold">
            パス
          </button>
        </div>
      )}
    </div>
  );
}
