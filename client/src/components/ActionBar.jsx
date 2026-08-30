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

  // 現在の選択が、サーバーが提示した「作れる役」のどれかにちょうど一致しているか
  // （オールマイティの属性割当はサーバー側で自動的に解決されるため、ここでは組み合わせの一致だけ見ればよい）
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
    <div className="bg-slate-800/80 rounded-xl p-3 flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-400 mr-2">
        {isMyTurn ? 'あなたの番です' : '相手の番です'}
      </span>
      <button
        onClick={attemptYaku}
        disabled={!canAttemptYaku}
        className="px-3 py-2 rounded-lg bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-sm font-bold"
      >
        役を成立させる
      </button>
      <button
        onClick={activateDassou}
        disabled={!canDassou}
        className="px-3 py-2 rounded-lg bg-rose-600 disabled:bg-slate-700 disabled:text-slate-500 text-sm font-bold"
      >
        だっそう発動
      </button>
      <button
        onClick={openKimagurePicker}
        disabled={!canKimagure}
        className="px-3 py-2 rounded-lg bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-sm font-bold"
      >
        きまぐれ発動
      </button>
      <button
        onClick={pass}
        disabled={!isMyTurn}
        className="px-3 py-2 rounded-lg bg-slate-600 disabled:bg-slate-700 disabled:text-slate-500 text-sm font-bold"
      >
        パス
      </button>
      <button
        onClick={clearSelection}
        className="px-3 py-2 rounded-lg bg-transparent border border-slate-600 text-slate-400 text-sm"
      >
        選択をクリア
      </button>
    </div>
  );
}
