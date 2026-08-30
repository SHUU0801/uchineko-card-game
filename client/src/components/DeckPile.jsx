export function DeckPile({ id, count, label }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div id={id} className="relative w-14 h-20">
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            transform: 'translate(3px, 3px)',
            background: 'linear-gradient(135deg, #2d1b12 0%, #1a0f0a 100%)',
            border: '2px solid #3d2a1e',
          }}
        />
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            transform: 'translate(1.5px, 1.5px)',
            background: 'linear-gradient(135deg, #2d1b12 0%, #1a0f0a 100%)',
            border: '2px solid #4d3a2e',
          }}
        />
        <div
          className="absolute inset-0 rounded-lg flex items-center justify-center text-lg"
          style={{
            background: 'linear-gradient(135deg, #3d2a1e 0%, #2d1b12 100%)',
            border: '2px solid #5c3d2e',
            boxShadow: 'inset 0 1px 0 rgba(212,164,74,0.1), 0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
          <span className="opacity-50">🐾</span>
        </div>
      </div>
      <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: '#8b7355' }}>
        {label}（{count}枚）
      </span>
    </div>
  );
}
