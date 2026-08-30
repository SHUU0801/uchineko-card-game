import { useGameStore } from '../store/gameStore';
import { socket } from './SocketManager';

export function GameOverScreen() {
  const gameOverInfo = useGameStore((s) => s.gameOverInfo);
  const myIndex = useGameStore((s) => s.myIndex);
  const rematchVotes = useGameStore((s) => s.rematchVotes);
  const reset = useGameStore((s) => s.reset);

  if (!gameOverInfo) {
    return <div className="p-6 text-center" style={{ color: '#8b7355' }}>結果を集計しています…</div>;
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
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-5 text-center pt-12">
      <div className="text-6xl mb-1" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
        {iWon ? '🎉' : '😿'}
      </div>
      <h2
        className="text-3xl font-black"
        style={{
          color: iWon ? '#f0d68a' : '#c4a882',
          textShadow: iWon ? '0 0 20px rgba(212,164,74,0.4)' : 'none',
        }}
      >
        {iWon ? '勝利！' : '敗北…'}
      </h2>
      <div className="game-panel p-4">
        <p className="text-sm font-bold" style={{ color: '#c4a882' }}>
          あなたのハウス: <span style={{ color: '#f0d68a', fontSize: '18px' }}>{finalScores[myIndex]}</span>匹
          <span style={{ color: '#5c3d2e' }}> ／ </span>
          相手のハウス: <span style={{ color: '#f0d68a', fontSize: '18px' }}>{finalScores[opponentIndex]}</span>匹
        </p>
      </div>

      <button
        onClick={requestRematch}
        disabled={iVoted}
        className="game-btn game-btn-gold"
      >
        もう一度対戦する
      </button>
      {iVoted && (
        <p className="text-xs font-bold" style={{ color: '#8b7355' }}>
          {opponentVoted ? 'まもなく再戦を開始します…' : '相手の返答を待っています…'}
        </p>
      )}
      {!iVoted && opponentVoted && (
        <p className="text-xs font-bold" style={{ color: '#d4a44a' }}>相手が再戦を希望しています！</p>
      )}

      <button onClick={backToHome} className="game-btn game-btn-neutral">
        ホームに戻る
      </button>
    </div>
  );
}
