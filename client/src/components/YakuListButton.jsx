import { useState } from 'react';
import { yakuDefs, attributeName } from '../data/masterData';

function AttributeChips({ ids }) {
  return (
    <span className="inline-flex gap-1 flex-wrap">
      {ids.map((id, i) => (
        <span
          key={i}
          className="rounded px-1.5 py-0.5 text-[11px] font-bold"
          style={{ background: 'rgba(92, 61, 46, 0.6)', color: '#c4a882', border: '1px solid rgba(92,61,46,0.8)' }}
        >
          {attributeName(id)}
        </span>
      ))}
    </span>
  );
}

function YakuRow({ yaku }) {
  if (yaku.matchType === 'distinctColorSet') {
    return (
      <div className="flex justify-between items-center gap-2 py-2" style={{ borderBottom: '1px solid rgba(92,61,46,0.4)' }}>
        <span className="font-black text-sm" style={{ color: '#f0d68a' }}>{yaku.name}</span>
        <span className="text-xs text-right" style={{ color: '#8b7355' }}>
          異なる5色を1枚ずつ（{yaku.cardCount}枚）
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-between items-center gap-2 py-2" style={{ borderBottom: '1px solid rgba(92,61,46,0.4)' }}>
      <span className="font-black text-sm" style={{ color: '#f0d68a' }}>{yaku.name}</span>
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
        className="px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer"
        style={{
          background: 'linear-gradient(180deg, #3d2a1e 0%, #2d1b12 100%)',
          border: '2px solid #5c3d2e',
          color: '#c4a882',
          boxShadow: '0 2px 0 #1a0f0a',
        }}
      >
        役一覧
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black" style={{ color: '#f0d68a' }}>役一覧</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-xs font-bold cursor-pointer"
                style={{ color: '#8b7355', textDecoration: 'underline' }}
              >
                閉じる
              </button>
            </div>

            <h4 className="text-xs font-black mt-2 mb-1" style={{ color: '#d4a44a' }}>
              あるある役（手札1＋場札1・計2枚）
            </h4>
            {arualu.map((y) => (
              <YakuRow key={y.id} yaku={y} />
            ))}

            <h4 className="text-xs font-black mt-5 mb-1" style={{ color: '#d4a44a' }}>
              きゅんきゅん役（手札1＋場札2・計3枚。大集会のみ手札1＋場札4・計5枚）
            </h4>
            {kyunkyun.map((y) => (
              <YakuRow key={y.id} yaku={y} />
            ))}

            <h4 className="text-xs font-black mt-5 mb-1" style={{ color: '#d4a44a' }}>ペア役（手札1＋場札1・計2枚）</h4>
            <p className="text-xs leading-relaxed" style={{ color: '#c4a882' }}>
              上の一覧に無い組み合わせでも、同じ属性のねこカードを2枚（手札1＋場札1）使うと「◯◯ペア」として成立します。
            </p>

            <h4 className="text-xs font-black mt-5 mb-1" style={{ color: '#d4a44a' }}>オールマイティ</h4>
            <p className="text-xs leading-relaxed" style={{ color: '#c4a882' }}>
              どの役でも、任意の属性のカードとして使えます（使用枚数の制限なし）。大集会だけは属性ではなく、そのカード自身の色として数えます。
            </p>
          </div>
        </div>
      )}
    </>
  );
}
