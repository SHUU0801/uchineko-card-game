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
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-4 text-center pt-12">
      <h2 className="text-lg font-bold" style={{ color: '#f0d68a' }}>ルームコード</h2>
      <div
        className="text-4xl font-mono tracking-widest py-5 rounded-xl font-black"
        style={{
          background: 'rgba(13, 8, 6, 0.6)',
          border: '2px solid #8b6914',
          color: '#f0d68a',
          textShadow: '0 0 12px rgba(212,164,74,0.4)',
        }}
      >
        {roomCode}
      </div>
      <button onClick={copyCode} className="game-btn game-btn-neutral">
        コードをコピー
      </button>
      <p className="text-xs" style={{ color: '#8b7355' }}>
        {myIndex === 0 ? 'このコードを相手に伝えて参加してもらってください' : '対戦相手に参加しました！まもなく開始します…'}
      </p>
      <p className="text-sm font-bold animate-pulse" style={{ color: '#d4a44a' }}>対戦相手を待っています…</p>
    </div>
  );
}
