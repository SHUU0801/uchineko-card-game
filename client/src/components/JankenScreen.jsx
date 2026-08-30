import { useGameStore } from '../store/gameStore';
import { socket } from './SocketManager';

const HAND_INFO = {
  rock: { emoji: '✊', label: 'グー' },
  scissors: { emoji: '✌️', label: 'チョキ' },
  paper: { emoji: '✋', label: 'パー' },
};

export function JankenScreen() {
  const view = useGameStore((s) => s.view);

  if (!view || !view.janken) return null;

  const { myChoice, opponentHasChosen, revealedChoices, winnerIndex } = view.janken;
  const myIndex = view.myIndex;
  const opponentIndex = myIndex === 0 ? 1 : 0;

  const throwHand = (hand) => {
    socket.emit('janken_throw', { hand });
  };

  const chooseTurnOrder = (goFirst) => {
    socket.emit('choose_turn_order', { goFirst });
  };

  if (view.phase === 'janken') {
    return (
      <div className="max-w-sm mx-auto p-6 flex flex-col gap-5 text-center pt-12">
        <h2 className="game-title text-xl">さいしょはにゃんじゃんけん！</h2>
        <p className="text-xs" style={{ color: '#8b7355' }}>勝った方が先攻・後攻を選べます</p>

        {myChoice ? (
          <div className="game-panel p-4">
            <p className="text-sm font-bold" style={{ color: '#c4a882' }}>
              {HAND_INFO[myChoice].emoji} を出しました。{opponentHasChosen ? '結果を判定しています…' : '相手を待っています…'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            {Object.entries(HAND_INFO).map(([hand, info]) => (
              <button
                key={hand}
                onClick={() => throwHand(hand)}
                className="janken-btn"
                title={info.label}
              >
                {info.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const iAmWinner = winnerIndex === myIndex;
  const myHand = revealedChoices ? revealedChoices[myIndex] : null;
  const opponentHand = revealedChoices ? revealedChoices[opponentIndex] : null;

  return (
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-5 text-center pt-12">
      <h2 className="game-title text-xl">さいしょはにゃんじゃんけん！</h2>
      <div className="flex justify-center items-center gap-6 text-5xl my-2">
        <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{HAND_INFO[myHand]?.emoji}</span>
        <span className="text-sm font-black" style={{ color: '#5c3d2e' }}>VS</span>
        <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{HAND_INFO[opponentHand]?.emoji}</span>
      </div>

      {iAmWinner ? (
        <>
          <p className="text-sm font-black" style={{ color: '#4ade80' }}>あなたの勝ちです！先攻・後攻を選んでください</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => chooseTurnOrder(true)} className="game-btn game-btn-primary">
              先攻を選ぶ
            </button>
            <button onClick={() => chooseTurnOrder(false)} className="game-btn game-btn-neutral">
              後攻を選ぶ
            </button>
          </div>
        </>
      ) : (
        <div className="game-panel p-4">
          <p className="text-sm font-bold" style={{ color: '#c4a882' }}>相手の勝ちです。相手が先攻・後攻を選んでいます…</p>
        </div>
      )}
    </div>
  );
}
