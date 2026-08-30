import { useGameStore } from '../store/gameStore';
import { HandZone } from './Zone/HandZone';
import { FieldZone } from './Zone/FieldZone';
import { HouseZone } from './Zone/HouseZone';
import { OpponentHandBack } from './Zone/OpponentHandBack';
import { DeckPile } from './DeckPile';
import { ActionBar } from './ActionBar';
import { KimagurePicker } from './KimagurePicker';
import { PkOverlay } from './PkOverlay';
import { YakuListButton } from './YakuListButton';
import { useNewCardIds } from '../utils/useNewCardIds';

export function Board() {
  const view = useGameStore((s) => s.view);
  const roomCode = useGameStore((s) => s.roomCode);
  const selection = useGameStore((s) => s.selection);
  const setHandCard = useGameStore((s) => s.setHandCard);
  const toggleFieldCardSelection = useGameStore((s) => s.toggleFieldCardSelection);
  const lastActionResult = useGameStore((s) => s.lastActionResult);
  const lastActionSeq = useGameStore((s) => s.lastActionSeq);
  const errorMessage = useGameStore((s) => s.errorMessage);
  const clearError = useGameStore((s) => s.clearError);
  const opponentLeft = useGameStore((s) => s.opponentLeft);

  const myHandNewIds = useNewCardIds(view ? view.me.hand : []);
  const myFieldNewIds = useNewCardIds(view ? view.me.field : []);
  const opponentFieldNewIds = useNewCardIds(view ? view.opponent.field : []);

  const isMyTurn = view ? view.phase === 'playing' && view.currentTurnPlayerIndex === useGameStore.getState().myIndex : false;
  const isMyPkTurn = view ? view.phase === 'pk' && view.pk && !view.pk.myActed : false;

  if (!view) {
    return <div className="p-6 text-center text-[#7a6a5a]">あいてをまっているよ…</div>;
  }

  const selectHandCard = (cardId) => setHandCard(selection.handCardId === cardId ? null : cardId);

  const possibleYaku = view.me.possibleYaku || [];
  const hintsActive = isMyTurn && !selection.handCardId;
  const candidatesForSelectedHand =
    isMyTurn && selection.handCardId
      ? possibleYaku.filter(
          (p) => p.handCardId === selection.handCardId && selection.fieldCardIds.every((id) => p.fieldCardIds.includes(id))
        )
      : [];
  const glowHandIds = hintsActive ? [...new Set(possibleYaku.map((p) => p.handCardId))] : [];

  const pkCandidates =
    isMyPkTurn && view.pk
      ? (view.pk.possibleYaku || []).filter((p) =>
          selection.fieldCardIds.every((id) => p.fieldCardIds.includes(id))
        )
      : [];

  const glowFieldIds = selection.handCardId
    ? [...new Set(candidatesForSelectedHand.flatMap((p) => p.fieldCardIds))]
    : isMyPkTurn
      ? [...new Set(pkCandidates.flatMap((p) => p.fieldCardIds))]
      : [];

  let turnBannerClass = 'turn-banner turn-banner-opponent';
  let turnBannerText = 'あいてのばん';
  if (view.phase === 'pk') {
    turnBannerClass = 'turn-banner turn-banner-pk';
    turnBannerText = isMyPkTurn ? 'サドンデス：きみのばん' : 'サドンデス：あいてのばん';
  } else if (isMyTurn) {
    turnBannerClass = 'turn-banner turn-banner-mine';
    turnBannerText = 'きみのばんだよ！';
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-3">
      <div className={turnBannerClass}>{turnBannerText}</div>

      <div className="flex justify-between items-center text-[11px] text-[#7a6a5a]">
        <span>{roomCode}</span>
        <span>
          {view.turnCountPerPlayer[view.myIndex]}/4 ・ {view.turnCountPerPlayer[view.myIndex === 0 ? 1 : 0]}/4
        </span>
        <YakuListButton />
      </div>

      {opponentLeft && (
        <div className="game-panel p-3 text-sm text-center font-bold text-[#c0392b]">
          あいてがぬけちゃった
        </div>
      )}

      {errorMessage && (
        <div className="game-panel p-3 text-sm text-center cursor-pointer font-bold text-[#c0392b]" onClick={clearError}>
          {errorMessage}
        </div>
      )}

      {lastActionResult && lastActionResult.kind !== 'pass' && (
        <div key={lastActionSeq} className="animate-yaku-flash game-panel-gold p-3 text-sm text-center font-bold text-[#c49a3c]">
          {lastActionResult.kind === 'yaku' && `🎉 ${lastActionResult.yakuName}！`}
          {lastActionResult.kind === 'pair' && `🎉 ${lastActionResult.yakuName || 'ペア'}！`}
          {lastActionResult.kind === 'dassou' && '💨 だっそう！あいてのハウスをリセット'}
          {lastActionResult.kind === 'kimagure' && '🎲 きまぐれ！あいての場札を1枚もどした'}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <DeckPile id="deck-pile-opponent" count={view.opponent.deckCount} label="あいて" />
          <div className="flex-1 space-y-2">
            <OpponentHandBack count={view.opponent.handCount} />
            <FieldZone label="あいての場札" cards={view.opponent.field} newCardIds={opponentFieldNewIds} flyFromId="deck-pile-opponent" />
          </div>
        </div>
        <HouseZone label="あいてのハウス" cards={view.opponent.house} />
      </div>

      <div className="border-t border-[#2a211a]" />

      <div className="space-y-2">
        <HouseZone label="じぶんのハウス" cards={view.me.house} />
        <div className="flex items-start gap-3">
          <DeckPile id="deck-pile-me" count={view.me.deckCount} label="じぶん" />
          <div className="flex-1 space-y-2">
            <FieldZone
              label="じぶんの場札"
              cards={view.me.field}
              selectable={isMyTurn || isMyPkTurn}
              selectedIds={selection.fieldCardIds}
              onToggle={toggleFieldCardSelection}
              glowIds={glowFieldIds}
              newCardIds={myFieldNewIds}
              flyFromId="deck-pile-me"
            />
            <HandZone
              cards={view.me.hand}
              selectedHandCardId={selection.handCardId}
              onSelectHandCard={selectHandCard}
              disabled={!isMyTurn}
              glowIds={glowHandIds}
              newCardIds={myHandNewIds}
              flyFromId="deck-pile-me"
            />
          </div>
        </div>
      </div>

      {view.phase === 'playing' && <ActionBar />}
      {view.phase === 'pk' && <PkOverlay />}
      <KimagurePicker />
    </div>
  );
}
