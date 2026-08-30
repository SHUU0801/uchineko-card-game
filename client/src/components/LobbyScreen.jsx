import { useGameStore } from '../store/gameStore';

export function LobbyScreen() {
  const roomCode = useGameStore((s) => s.roomCode);
  const myIndex = useGameStore((s) => s.myIndex);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-xs mx-auto p-6 flex flex-col gap-4 text-center pt-16">
      <h2 className="text-lg font-bold text-[#c49a3c]">ルームコード</h2>
      <div className="text-4xl font-mono tracking-widest py-5 rounded-2xl font-black bg-[#231c17] border border-[#3a2e28] text-[#c49a3c]">
        {roomCode}
      </div>
      <button onClick={copyCode} className="game-btn game-btn-neutral">
        コピーする
      </button>
      <p className="text-xs text-[#7a6a5a]">
        {myIndex === 0 ? 'このコードを相手に伝えてね' : '参加しました！まもなく開始…'}
      </p>
      <p className="text-sm font-bold text-[#c49a3c] animate-pulse">あいてをまっています…</p>
    </div>
  );
}
