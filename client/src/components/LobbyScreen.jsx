import { useGameStore } from '../store/gameStore';

export function LobbyScreen() {
  const roomCode = useGameStore((s) => s.roomCode);
  const myIndex = useGameStore((s) => s.myIndex);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {
      // クリップボードAPIが使えない環境では無視（コードは画面に表示済み）
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-4 text-center">
      <h2 className="text-lg font-bold">ルームコード</h2>
      <div className="text-4xl font-mono tracking-widest bg-slate-800 rounded-xl py-4">{roomCode}</div>
      <button onClick={copyCode} className="py-2 rounded-lg bg-slate-700 text-sm">
        コードをコピー
      </button>
      <p className="text-xs text-slate-400">
        {myIndex === 0 ? 'このコードを相手に伝えて参加してもらってください' : '対戦相手に参加しました！まもなく開始します…'}
      </p>
      <p className="text-sm text-slate-300 animate-pulse">対戦相手を待っています…</p>
    </div>
  );
}
