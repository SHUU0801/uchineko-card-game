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
    if (!alreadySelected && chosenCount >= 4) return;
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
      <h2 className="text-lg font-bold text-[#c49a3c]">場札にする4枚をえらんでね</h2>
      <p className="text-xs text-[#7a6a5a]">
        8枚ひいたよ。4枚を場札にして、のこりは手札になるよ（{chosenCount} / 4）
      </p>

      <div className="flex justify-center">
        <DeckPile id="deck-pile-setup" count={view.me.deckCount} label="やまふだ" />
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

      <button onClick={confirm} disabled={!canConfirm} className="game-btn game-btn-primary">
        {iAmReady ? 'えらびずみ' : 'けってい！'}
      </button>

      <p className="text-xs font-bold text-[#7a6a5a]">
        {iAmReady
          ? opponentReady ? 'まもなくスタート…' : 'あいてをまっているよ…'
          : opponentReady ? 'あいてはえらびずみ。きみのばんだよ！' : ''}
      </p>
    </div>
  );
}
