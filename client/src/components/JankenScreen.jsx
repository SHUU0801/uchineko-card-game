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
      <div className="max-w-sm mx-auto p-6 flex flex-col gap-4 text-center">
        <h2 className="text-lg font-bold">🐱 さいしょはにゃんじゃんけん！</h2>
        <p className="text-xs text-slate-400">勝った方が先攻・後攻を選べます</p>

        {myChoice ? (
          <p className="text-sm text-slate-300">
            {HAND_INFO[myChoice].emoji} を出しました。{opponentHasChosen ? '結果を判定しています…' : '相手を待っています…'}
          </p>
        ) : (
          <div className="flex justify-center gap-3">
            {Object.entries(HAND_INFO).map(([hand, info]) => (
              <button
                key={hand}
                onClick={() => throwHand(hand)}
                className="w-20 h-20 rounded-xl bg-slate-700 hover:bg-slate-600 text-3xl flex items-center justify-center"
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

  // phase === 'janken_choice'
  const iAmWinner = winnerIndex === myIndex;
  const myHand = revealedChoices ? revealedChoices[myIndex] : null;
  const opponentHand = revealedChoices ? revealedChoices[opponentIndex] : null;

  return (
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-4 text-center">
      <h2 className="text-lg font-bold">🐱 さいしょはにゃんじゃんけん！</h2>
      <div className="flex justify-center items-center gap-6 text-4xl">
        <span>{HAND_INFO[myHand]?.emoji}</span>
        <span className="text-sm text-slate-400">vs</span>
        <span>{HAND_INFO[opponentHand]?.emoji}</span>
      </div>

      {iAmWinner ? (
        <>
          <p className="text-sm font-bold text-emerald-400">あなたの勝ちです！先攻・後攻を選んでください</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => chooseTurnOrder(true)}
              className="px-4 py-3 rounded-xl bg-emerald-600 font-bold"
            >
              先攻を選ぶ
            </button>
            <button
              onClick={() => chooseTurnOrder(false)}
              className="px-4 py-3 rounded-xl bg-slate-700 font-bold"
            >
              後攻を選ぶ
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-300">相手の勝ちです。相手が先攻・後攻を選んでいます…</p>
      )}
    </div>
  );
}
