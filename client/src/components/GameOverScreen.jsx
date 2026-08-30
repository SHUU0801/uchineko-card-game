import { useGameStore } from '../store/gameStore';
import { socket } from './SocketManager';

export function GameOverScreen() {
  const gameOverInfo = useGameStore((s) => s.gameOverInfo);
  const myIndex = useGameStore((s) => s.myIndex);
  const reset = useGameStore((s) => s.reset);

  if (!gameOverInfo) {
    return <div className="p-6 text-center text-slate-400">結果を集計しています…</div>;
  }

  const { winnerIndex, finalScores } = gameOverInfo;
  const iWon = winnerIndex === myIndex;

  const backToHome = () => {
    socket.emit('leave_room');
    reset();
  };

  return (
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-4 text-center">
      <h2 className="text-3xl font-bold">{iWon ? '🎉 勝利！' : '😿 敗北…'}</h2>
      <p className="text-sm text-slate-300">
        あなたのハウス: {finalScores[myIndex]}匹 ／ 相手のハウス: {finalScores[myIndex === 0 ? 1 : 0]}匹
      </p>
      <button onClick={backToHome} className="py-3 rounded-xl bg-emerald-600 font-bold">
        ホームに戻る
      </button>
    </div>
  );
}
