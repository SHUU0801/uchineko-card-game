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
      <div className="max-w-xs mx-auto p-6 flex flex-col gap-5 text-center pt-16">
        <h2 className="game-title text-xl">さいしょはにゃん<br />じゃんけんぽい！</h2>
        <p className="text-xs text-[#7a6a5a]">かった方が先攻・後攻をえらべるよ</p>

        {myChoice ? (
          <div className="game-panel p-4">
            <p className="text-sm font-bold text-[#9a8776]">
              {HAND_INFO[myChoice].emoji} を出したよ。{opponentHasChosen ? '判定中…' : 'あいてをまってるよ…'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center gap-5">
            {Object.entries(HAND_INFO).map(([hand, info]) => (
              <button
                key={hand}
                onClick={() => throwHand(hand)}
                className="w-[72px] h-[72px] rounded-full bg-[#2a211a] border-2 border-[#4a3a2e] text-3xl flex items-center justify-center cursor-pointer transition-all hover:border-[#c49a3c] hover:scale-105 active:scale-95"
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
    <div className="max-w-xs mx-auto p-6 flex flex-col gap-5 text-center pt-16">
      <h2 className="game-title text-xl">じゃんけん結果</h2>
      <div className="flex justify-center items-center gap-6 text-5xl my-2">
        <span>{HAND_INFO[myHand]?.emoji}</span>
        <span className="text-sm font-black text-[#4a3a2e]">VS</span>
        <span>{HAND_INFO[opponentHand]?.emoji}</span>
      </div>

      {iAmWinner ? (
        <>
          <p className="text-sm font-bold text-[#6fcf73]">かち！先攻・後攻をえらんでね</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => chooseTurnOrder(true)} className="game-btn game-btn-primary">先攻</button>
            <button onClick={() => chooseTurnOrder(false)} className="game-btn game-btn-neutral">後攻</button>
          </div>
        </>
      ) : (
        <div className="game-panel p-4">
          <p className="text-sm font-bold text-[#9a8776]">あいてのかち。えらんでいるよ…</p>
        </div>
      )}
    </div>
  );
}
