import { useGameStore } from '../store/gameStore';
import { socket } from './SocketManager';

export function GameOverScreen() {
  const gameOverInfo = useGameStore((s) => s.gameOverInfo);
  const myIndex = useGameStore((s) => s.myIndex);
  const rematchVotes = useGameStore((s) => s.rematchVotes);
  const reset = useGameStore((s) => s.reset);

  if (!gameOverInfo) {
    return <div className="p-6 text-center text-slate-400">結果を集計しています…</div>;
  }

  const { winnerIndex, finalScores } = gameOverInfo;
  const iWon = winnerIndex === myIndex;

  const opponentIndex = myIndex === 0 ? 1 : 0;
  const iVoted = !!(rematchVotes && rematchVotes[myIndex]);
  const opponentVoted = !!(rematchVotes && rematchVotes[opponentIndex]);

  const backToHome = () => {
    socket.emit('leave_room');
    reset();
  };

  const requestRematch = () => {
    socket.emit('request_rematch');
  };

  return (
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-4 text-center">
      <h2 className="text-3xl font-bold">{iWon ? '🎉 勝利！' : '😿 敗北…'}</h2>
      <p className="text-sm text-slate-300">
        あなたのハウス: {finalScores[myIndex]}匹 ／ 相手のハウス: {finalScores[opponentIndex]}匹
      </p>

      <button
        onClick={requestRematch}
        disabled={iVoted}
        className="py-3 rounded-xl bg-amber-600 disabled:bg-slate-700 disabled:text-slate-400 font-bold"
      >
        🔁 もう一度対戦する
      </button>
      {iVoted && (
        <p className="text-xs text-slate-400">
          {opponentVoted ? 'まもなく再戦を開始します…' : '相手の返答を待っています…'}
        </p>
      )}
      {!iVoted && opponentVoted && (
        <p className="text-xs text-amber-300">相手が再戦を希望しています！</p>
      )}

      <button onClick={backToHome} className="py-3 rounded-xl bg-slate-700 font-bold">
        ホームに戻る
      </button>
    </div>
  );
}
