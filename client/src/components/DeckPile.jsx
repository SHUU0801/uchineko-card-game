export function DeckPile({ id, count, label }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div id={id} className="relative w-14 h-20">
        <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-lg bg-[#1a1210] border border-[#2a211a]" />
        <div className="absolute inset-0 translate-x-[1.5px] translate-y-[1.5px] rounded-lg bg-[#201a14] border border-[#2a211a]" />
        <div className="absolute inset-0 rounded-lg bg-[#2a211a] border border-[#4a3a2e] flex items-center justify-center">
          <span className="text-lg opacity-30">🐾</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-[#7a6a5a] whitespace-nowrap">
        {label}（{count}）
      </span>
    </div>
  );
}
