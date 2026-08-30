import { useGameStore } from '../store/gameStore';
import { socket } from './SocketManager';
import { Card } from './Card';
import { DeckPile } from './DeckPile';
import { YakuListButton } from './YakuListButton';

export function SetupScreen() {
  const view = useGameStore((s) => s.view);
  const selection = useGameStore((s) => s.selection);
  const toggleFieldCardSelection = useGameStore((s) => s.toggleFieldCardSelection);

  if (!view) return null;

  const myIndex = view.myIndex;
  const opponentIndex = myIndex === 0 ? 1 : 0;
  const iAmReady = view.setupComplete ? view.setupComplete[myIndex] : false;
  const opponentReady = view.setupComplete ? view.setupComplete[opponentIndex] : false;

  const chosenCount = selection.fieldCardIds.length;
  const canConfirm = chosenCount === 4 && !iAmReady;

  const toggle = (cardId) => {
    if (iAmReady) return;
    const alreadySelected = selection.fieldCardIds.includes(cardId);
    if (!alreadySelected && chosenCount >= 4) return; // 4枚まで
    toggleFieldCardSelection(cardId);
  };

  const confirm = () => {
    socket.emit('choose_field', { fieldCardIds: selection.fieldCardIds });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4 text-center">
      <div className="flex justify-end">
        <YakuListButton />
      </div>
      <h2 className="text-lg font-bold">場札にする4枚を選んでください</h2>
      <p className="text-xs text-slate-400">
        8枚引きました。このうち4枚を表向きの「場札」にします。残りの4枚は非公開の「手札」になります。（{chosenCount} / 4 選択中）
      </p>

      <div className="flex justify-center">
        <DeckPile id="deck-pile-setup" count={view.me.deckCount} label="自分の山札（残り）" />
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {view.me.hand.map((card) => (
          <Card
            key={card.id}
            card={card}
            selected={selection.fieldCardIds.includes(card.id)}
            disabled={iAmReady}
            onClick={() => toggle(card.id)}
          />
        ))}
      </div>

      <button
        onClick={confirm}
        disabled={!canConfirm}
        className="py-3 rounded-xl bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 font-bold"
      >
        {iAmReady ? '選択済み' : 'この4枚に決定する'}
      </button>

      <p className="text-xs text-slate-400">
        {iAmReady
          ? opponentReady
            ? 'まもなく開始します…'
            : '相手の選択を待っています…'
          : opponentReady
            ? '相手は選択済みです。あなたの選択をお待ちしています。'
            : ''}
      </p>
    </div>
  );
}
