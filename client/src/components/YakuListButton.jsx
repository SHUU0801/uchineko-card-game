import { useState } from 'react';
import { yakuDefs, attributeName } from '../data/masterData';

function AttributeChips({ ids }) {
  return (
    <span className="inline-flex gap-1 flex-wrap">
      {ids.map((id, i) => (
        <span key={i} className="bg-slate-700 rounded px-1.5 py-0.5 text-[11px]">
          {attributeName(id)}
        </span>
      ))}
    </span>
  );
}

function YakuRow({ yaku }) {
  if (yaku.matchType === 'distinctColorSet') {
    return (
      <div className="flex justify-between items-center gap-2 py-1.5 border-b border-slate-700/60">
        <span className="font-bold text-sm">{yaku.name}</span>
        <span className="text-xs text-slate-400 text-right">
          異なる5色を1枚ずつ（属性名は問わない・{yaku.cardCount}枚）
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-between items-center gap-2 py-1.5 border-b border-slate-700/60">
      <span className="font-bold text-sm">{yaku.name}</span>
      <AttributeChips ids={yaku.requiredAttributes} />
    </div>
  );
}

export function YakuListButton() {
  const [open, setOpen] = useState(false);
  const arualu = yakuDefs.filter((y) => y.category === 'arualu');
  const kyunkyun = yakuDefs.filter((y) => y.category === 'kyunkyun');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold"
      >
        📖 役一覧
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-4 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold">役一覧</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 text-xs underline">
                閉じる
              </button>
            </div>

            <h4 className="text-xs font-bold text-slate-400 mt-2 mb-1">
              あるある役（手札1＋場札1・計2枚）
            </h4>
            {arualu.map((y) => (
              <YakuRow key={y.id} yaku={y} />
            ))}

            <h4 className="text-xs font-bold text-slate-400 mt-4 mb-1">
              きゅんきゅん役（手札1＋場札2・計3枚。大集会のみ手札1＋場札4・計5枚）
            </h4>
            {kyunkyun.map((y) => (
              <YakuRow key={y.id} yaku={y} />
            ))}

            <h4 className="text-xs font-bold text-slate-400 mt-4 mb-1">ペア役（手札1＋場札1・計2枚）</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              上の一覧に無い組み合わせでも、同じ属性のねこカードを2枚（手札1＋場札1）使うと「◯◯ペア」として成立します。
            </p>

            <h4 className="text-xs font-bold text-slate-400 mt-4 mb-1">オールマイティ</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              どの役でも、任意の属性のカードとして使えます（使用枚数の制限なし）。大集会だけは属性ではなく、そのカード自身の色として数えます。
            </p>
          </div>
        </div>
      )}
    </>
  );
}
