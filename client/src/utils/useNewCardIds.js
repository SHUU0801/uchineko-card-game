import { useState } from 'react';

// 直前の描画時点のカードid集合と比較し、今回新しく増えたカードidの集合を返す。
// 初回描画では「新規」を検出しない（ゲーム開始時に全カードが飛んでくるのを防ぐ）。
//
// レンダー中に前回値と比較してstateを更新する、Reactの「レンダー中の派生state」パターンを使う
// （ref.currentをレンダー中に読むのはeslint-plugin-react-hooksで禁止されているため使わない）。
export function useNewCardIds(cards) {
  const currentIds = new Set(cards.map((c) => c.id));
  const [prevIds, setPrevIds] = useState(null);
  const [newIds, setNewIds] = useState(() => new Set());

  const changed =
    prevIds === null || currentIds.size !== prevIds.size || [...currentIds].some((id) => !prevIds.has(id));

  if (changed) {
    const computed = prevIds === null ? new Set() : new Set([...currentIds].filter((id) => !prevIds.has(id)));
    setPrevIds(currentIds);
    setNewIds(computed);
  }

  return newIds;
}
