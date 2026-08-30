import { useGameStore } from '../store/gameStore';
import { HandZone } from './Zone/HandZone';
import { FieldZone } from './Zone/FieldZone';
import { HouseZone } from './Zone/HouseZone';
import { OpponentHandBack } from './Zone/OpponentHandBack';
import { ActionBar } from './ActionBar';
import { KimagurePicker } from './KimagurePicker';
import { PkOverlay } from './PkOverlay';
import { YakuListButton } from './YakuListButton';

export function Board() {
  const view = useGameStore((s) => s.view);
  const roomCode = useGameStore((s) => s.roomCode);
  const selection = useGameStore((s) => s.selection);
  const setHandCard = useGameStore((s) => s.setHandCard);
  const toggleFieldCardSelection = useGameStore((s) => s.toggleFieldCardSelection);
  const lastActionResult = useGameStore((s) => s.lastActionResult);
  const errorMessage = useGameStore((s) => s.errorMessage);
  const clearError = useGameStore((s) => s.clearError);
  const opponentLeft = useGameStore((s) => s.opponentLeft);

  const isMyTurn = view ? view.phase === 'playing' && view.currentTurnPlayerIndex === useGameStore.getState().myIndex : false;
  const isMyPkTurn = view ? view.phase === 'pk' && view.pk && !view.pk.myActed : false;

  if (!view) {
    return <div className="p-6 text-center text-slate-400">対戦相手を待っています…</div>;
  }

  const selectHandCard = (cardId) => setHandCard(selection.handCardId === cardId ? null : cardId);

  // このカード・組み合わせなら役が作れるかもしれない、という光るヒント（非権威・UI補助のみ）。
  // オールマイティが絡む組み合わせもサーバー側で属性を自動解決した上でヒントに含まれる。
  const possibleYaku = view.me.possibleYaku || [];
  const hintsActive = isMyTurn && !selection.handCardId;
  // 手札を選んだ後は、すでに選んだ場札を全て含む候補だけに絞り込み、残りの場札を光らせる
  // （3枚役・5枚役で1枚ずつ選んでいく過程でも正しく絞り込まれる）
  const candidatesForSelectedHand =
    isMyTurn && selection.handCardId
      ? possibleYaku.filter(
          (p) => p.handCardId === selection.handCardId && selection.fieldCardIds.every((id) => p.fieldCardIds.includes(id))
        )
      : [];
  const glowHandIds = hintsActive ? [...new Set(possibleYaku.map((p) => p.handCardId))] : [];

  // サドンデス中は「引いた1枚」が固定の手札役なので、場札側だけ絞り込んで光らせる
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

  let turnBannerClass = 'bg-slate-700 text-slate-300';
  let turnBannerText = '相手の番です';
  if (view.phase === 'pk') {
    turnBannerClass = 'bg-purple-700 text-white';
    turnBannerText = isMyPkTurn ? 'サドンデス：あなたの番です' : 'サドンデス：相手の入力を待っています';
  } else if (isMyTurn) {
    turnBannerClass = 'bg-emerald-600 text-white animate-pulse';
    turnBannerText = 'あなたの番です';
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <div className={`rounded-xl py-2 text-center font-bold ${turnBannerClass}`}>{turnBannerText}</div>

      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>ルーム: {roomCode}</span>
        <span>
          手番: {view.turnCountPerPlayer[view.myIndex]} / 4（自分） ・{' '}
          {view.turnCountPerPlayer[view.myIndex === 0 ? 1 : 0]} / 4（相手）
        </span>
        <YakuListButton />
      </div>

      {opponentLeft && (
        <div className="bg-red-900/60 rounded-lg p-2 text-sm text-center">相手が退出しました</div>
      )}

      {errorMessage && (
        <div
          className="bg-red-900/60 rounded-lg p-2 text-sm text-center cursor-pointer"
          onClick={clearError}
        >
          {errorMessage}（クリックで閉じる）
        </div>
      )}

      {lastActionResult && lastActionResult.kind !== 'pass' && (
        <div className="bg-emerald-900/60 rounded-lg p-2 text-sm text-center">
          {lastActionResult.kind === 'yaku' && `役成立: ${lastActionResult.yakuName}`}
          {lastActionResult.kind === 'pair' && `ペア役成立: ${lastActionResult.yakuName || 'ペア'}`}
          {lastActionResult.kind === 'dassou' && 'だっそう発動！相手のハウスをリセット'}
          {lastActionResult.kind === 'kimagure' && 'きまぐれ発動！相手の場札を1枚戻させた'}
        </div>
      )}

      <div className="space-y-2">
        <OpponentHandBack count={view.opponent.handCount} />
        <FieldZone label="相手の場札" cards={view.opponent.field} />
        <HouseZone label="相手のハウス" cards={view.opponent.house} />
      </div>

      <div className="border-t border-slate-700" />

      <div className="space-y-2">
        <HouseZone label="自分のハウス" cards={view.me.house} />
        <FieldZone
          label="自分の場札"
          cards={view.me.field}
          selectable={isMyTurn || isMyPkTurn}
          selectedIds={selection.fieldCardIds}
          onToggle={toggleFieldCardSelection}
          glowIds={glowFieldIds}
        />
        <HandZone
          cards={view.me.hand}
          selectedHandCardId={selection.handCardId}
          onSelectHandCard={selectHandCard}
          disabled={!isMyTurn}
          glowIds={glowHandIds}
        />
      </div>

      {view.phase === 'playing' && <ActionBar />}
      {view.phase === 'pk' && <PkOverlay />}
      <KimagurePicker />
    </div>
  );
}
