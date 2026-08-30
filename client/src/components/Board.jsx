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
    return <div className="p-6 text-center" style={{ color: '#8b7355' }}>対戦相手を待っています…</div>;
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
  let turnBannerText = '相手の番です';
  if (view.phase === 'pk') {
    turnBannerClass = 'turn-banner turn-banner-pk';
    turnBannerText = isMyPkTurn ? 'サドンデス：あなたの番です' : 'サドンデス：相手の入力を待っています';
  } else if (isMyTurn) {
    turnBannerClass = 'turn-banner turn-banner-mine';
    turnBannerText = 'あなたの番です';
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <div className={turnBannerClass}>{turnBannerText}</div>

      <div className="flex justify-between items-center text-xs" style={{ color: '#8b7355' }}>
        <span className="font-bold">Room: {roomCode}</span>
        <span>
          手番: {view.turnCountPerPlayer[view.myIndex]} / 4（自分） ・{' '}
          {view.turnCountPerPlayer[view.myIndex === 0 ? 1 : 0]} / 4（相手）
        </span>
        <YakuListButton />
      </div>

      {opponentLeft && (
        <div className="game-panel p-3 text-sm text-center font-bold" style={{ borderColor: '#dc2626', color: '#ef4444' }}>
          相手が退出しました
        </div>
      )}

      {errorMessage && (
        <div
          className="game-panel p-3 text-sm text-center cursor-pointer font-bold"
          style={{ borderColor: '#dc2626', color: '#ef4444' }}
          onClick={clearError}
        >
          {errorMessage}（クリックで閉じる）
        </div>
      )}

      {lastActionResult && lastActionResult.kind !== 'pass' && (
        <div
          key={lastActionSeq}
          className="animate-yaku-flash game-panel-gold p-3 text-sm text-center font-black"
          style={{ color: '#f0d68a' }}
        >
          {lastActionResult.kind === 'yaku' && `🎉 役成立: ${lastActionResult.yakuName}`}
          {lastActionResult.kind === 'pair' && `🎉 ペア役成立: ${lastActionResult.yakuName || 'ペア'}`}
          {lastActionResult.kind === 'dassou' && '💨 だっそう発動！相手のハウスをリセット'}
          {lastActionResult.kind === 'kimagure' && '🎲 きまぐれ発動！相手の場札を1枚戻させた'}
        </div>
      )}

      {/* 相手エリア */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <DeckPile id="deck-pile-opponent" count={view.opponent.deckCount} label="相手の山札" />
          <div className="flex-1 space-y-2">
            <OpponentHandBack count={view.opponent.handCount} />
            <FieldZone
              label="相手の場札"
              cards={view.opponent.field}
              newCardIds={opponentFieldNewIds}
              flyFromId="deck-pile-opponent"
            />
          </div>
        </div>
        <HouseZone label="相手のハウス" cards={view.opponent.house} />
      </div>

      {/* 区切り線 */}
      <div style={{ borderTop: '1px solid rgba(212, 164, 74, 0.15)' }} />

      {/* 自分エリア */}
      <div className="space-y-2">
        <HouseZone label="自分のハウス" cards={view.me.house} />
        <div className="flex items-start gap-3">
          <DeckPile id="deck-pile-me" count={view.me.deckCount} label="自分の山札" />
          <div className="flex-1 space-y-2">
            <FieldZone
              label="自分の場札"
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
