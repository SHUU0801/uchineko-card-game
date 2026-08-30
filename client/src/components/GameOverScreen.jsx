import { useGameStore } from '../store/gameStore';
import { socket } from './SocketManager';

export function GameOverScreen() {
  const gameOverInfo = useGameStore((s) => s.gameOverInfo);
  const myIndex = useGameStore((s) => s.myIndex);
  const rematchVotes = useGameStore((s) => s.rematchVotes);
  const reset = useGameStore((s) => s.reset);
  const showResultBoard = useGameStore((s) => s.showResultBoard);

  if (!gameOverInfo) {
    return <div className="p-6 text-center text-[#7a6a5a]">けっかをまとめているよ…</div>;
  }

  const { winnerIndex, finalScores } = gameOverInfo;
  const iWon = winnerIndex === myIndex;
  const opponentIndex = myIndex === 0 ? 1 : 0;
  const iVoted = !!(rematchVotes && rematchVotes[myIndex]);
  const opponentVoted = !!(rematchVotes && rematchVotes[opponentIndex]);

  return (
    <div className="max-w-xs mx-auto p-6 flex flex-col gap-4 text-center pt-12">
      <div className="text-6xl mb-1">{iWon ? '🎉' : '😿'}</div>
      <h2 className="text-3xl font-bold text-[#c49a3c]">
        {iWon ? 'かち！' : 'まけ…'}
      </h2>
      <div className="game-panel p-4">
        <p className="text-sm font-bold text-[#9a8776]">
          じぶん <span className="text-lg text-[#c49a3c]">{finalScores[myIndex]}</span>匹
          <span className="text-[#4a3a2e]"> ／ </span>
          あいて <span className="text-lg text-[#c49a3c]">{finalScores[opponentIndex]}</span>匹
        </p>
      </div>

      <button onClick={showResultBoard} className="game-btn game-btn-neutral">
        ばんめんをみる
      </button>

      <button onClick={() => socket.emit('request_rematch')} disabled={iVoted} className="game-btn game-btn-gold">
        もういっかい！
      </button>
      {iVoted && (
        <p className="text-xs font-bold text-[#7a6a5a]">
          {opponentVoted ? 'もうすぐはじまるよ…' : 'あいてのへんじをまっているよ…'}
        </p>
      )}
      {!iVoted && opponentVoted && (
        <p className="text-xs font-bold text-[#c49a3c]">あいてがもういっかいやりたいって！</p>
      )}

      <button onClick={() => { socket.emit('leave_room'); reset(); }} className="game-btn game-btn-neutral">
        ホームにもどる
      </button>
    </div>
  );
}
