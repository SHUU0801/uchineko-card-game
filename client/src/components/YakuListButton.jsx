import { useState } from 'react';
import { yakuDefs, attributeName } from '../data/masterData';

function AttributeChips({ ids }) {
  return (
    <span className="inline-flex gap-1 flex-wrap">
      {ids.map((id, i) => (
        <span key={i} className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-[#2a211a] text-[#9a8776]">
          {attributeName(id)}
        </span>
      ))}
    </span>
  );
}

function YakuRow({ yaku }) {
  if (yaku.matchType === 'distinctColorSet') {
    return (
      <div className="flex justify-between items-center gap-2 py-2 border-b border-[#2a211a]">
        <span className="font-bold text-sm text-[#c49a3c]">{yaku.name}</span>
        <span className="text-xs text-[#7a6a5a] text-right">5色×1枚（{yaku.cardCount}枚）</span>
      </div>
    );
  }
  return (
    <div className="flex justify-between items-center gap-2 py-2 border-b border-[#2a211a]">
      <span className="font-bold text-sm text-[#c49a3c]">{yaku.name}</span>
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
        className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#2a211a] text-[#9a8776] cursor-pointer hover:text-[#c49a3c]"
      >
        やく一覧
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#c49a3c]">やく一覧</h3>
              <button onClick={() => setOpen(false)} className="text-xs font-bold text-[#7a6a5a] underline cursor-pointer">
                とじる
              </button>
            </div>

            <h4 className="text-xs font-bold text-[#c49a3c] mt-2 mb-1">あるあるやく（2枚）</h4>
            {arualu.map((y) => <YakuRow key={y.id} yaku={y} />)}

            <h4 className="text-xs font-bold text-[#c49a3c] mt-5 mb-1">きゅんきゅんやく（3枚 / 大集会5枚）</h4>
            {kyunkyun.map((y) => <YakuRow key={y.id} yaku={y} />)}

            <h4 className="text-xs font-bold text-[#c49a3c] mt-5 mb-1">ペアやく（2枚）</h4>
            <p className="text-xs text-[#9a8776] leading-relaxed">
              おなじぞくせいのねこ2枚で「◯◯ペア」になるよ
            </p>

            <h4 className="text-xs font-bold text-[#c49a3c] mt-5 mb-1">オールマイティ</h4>
            <p className="text-xs text-[#9a8776] leading-relaxed">
              どのぞくせいにもなれるまんのうカード。大集会ではカードじたいの色でかぞえるよ
            </p>
          </div>
        </div>
      )}
    </>
  );
}
