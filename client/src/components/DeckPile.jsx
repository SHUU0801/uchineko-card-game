// 山札の見た目（伏せカードを重ねたスタック）。ドロー演出の飛び出し元(id)としても使う。
export function DeckPile({ id, count, label }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div id={id} className="relative w-14 h-20">
        <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg border-2 border-slate-700 bg-slate-800" />
        <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-lg border-2 border-slate-700 bg-slate-800" />
        <div className="absolute inset-0 rounded-lg border-2 border-slate-500 bg-slate-800 flex items-center justify-center text-lg">
          🐾
        </div>
      </div>
      <span className="text-[10px] text-slate-400 whitespace-nowrap">
        {label}（{count}枚）
      </span>
    </div>
  );
}
