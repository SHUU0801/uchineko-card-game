import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Card } from './Card';
import { playCountTickSound, playAnnounceSound } from '../utils/sound';

const TICK_MS = 180;

export function RefereeScreen() {
  const view = useGameStore((s) => s.view);
  const pendingGameOverInfo = useGameStore((s) => s.pendingGameOverInfo);
  const myIndex = useGameStore((s) => s.myIndex);
  const finishJudging = useGameStore((s) => s.finishJudging);

  const [stage, setStage] = useState('intro'); // intro -> count_opponent -> count_me -> announce
  const [opponentCount, setOpponentCount] = useState(0);
  const [myCount, setMyCount] = useState(0);

  const opponentHouse = view ? view.opponent.house : [];
  const myHouse = view ? view.me.house : [];

  useEffect(() => {
    if (stage !== 'intro') return undefined;
    const t = setTimeout(() => setStage('count_opponent'), 1000);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'count_opponent') return undefined;
    if (opponentCount >= opponentHouse.length) {
      const t = setTimeout(() => setStage('count_me'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      playCountTickSound();
      setOpponentCount((c) => c + 1);
    }, TICK_MS);
    return () => clearTimeout(t);
  }, [stage, opponentCount, opponentHouse.length]);

  useEffect(() => {
    if (stage !== 'count_me') return undefined;
    if (myCount >= myHouse.length) {
      const t = setTimeout(() => {
        playAnnounceSound();
        setStage('announce');
      }, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      playCountTickSound();
      setMyCount((c) => c + 1);
    }, TICK_MS);
    return () => clearTimeout(t);
  }, [stage, myCount, myHouse.length]);

  if (!view || !pendingGameOverInfo) {
    return <div className="p-6 text-center text-[#7a6a5a]">はんていのじゅんびをしているよ…</div>;
  }

  const isDraw = pendingGameOverInfo.winnerIndex === null || pendingGameOverInfo.winnerIndex === undefined;
  const iWon = !isDraw && pendingGameOverInfo.winnerIndex === myIndex;

  let title = 'しんぱんが とうじょう！';
  let subtitle = 'ハウスのねこを かぞえるよ';
  if (stage === 'count_opponent') { title = 'あいてのハウスを かぞえちゅう…'; subtitle = ''; }
  if (stage === 'count_me') { title = 'じぶんのハウスを かぞえちゅう…'; subtitle = ''; }
  if (stage === 'announce') { title = 'はんてい けっか'; subtitle = ''; }

  const showOpponentPanel = stage !== 'intro';
  const showMyPanel = stage === 'count_me' || stage === 'announce';

  return (
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-4 text-center pt-10">
      <div className="text-5xl">🧑‍⚖️</div>
      <h2 className="game-title text-lg">{title}</h2>
      {subtitle && <p className="text-xs text-[#7a6a5a]">{subtitle}</p>}

      {showOpponentPanel && (
        <div className="game-panel p-3">
          <p className="text-xs font-bold text-[#9a8776] mb-2">あいてのハウス</p>
          <div className="flex gap-1 flex-wrap justify-center min-h-[4.5rem]">
            {opponentHouse
              .slice(0, stage === 'count_opponent' ? opponentCount : opponentHouse.length)
              .map((c) => (
                <Card key={c.id} card={c} small />
              ))}
          </div>
          <p className="text-xl font-black text-[#c49a3c] mt-1">
            {stage === 'count_opponent' ? opponentCount : opponentHouse.length}
            <span className="text-xs">匹</span>
          </p>
        </div>
      )}

      {showMyPanel && (
        <div className="game-panel p-3">
          <p className="text-xs font-bold text-[#9a8776] mb-2">じぶんのハウス</p>
          <div className="flex gap-1 flex-wrap justify-center min-h-[4.5rem]">
            {myHouse
              .slice(0, stage === 'count_me' ? myCount : myHouse.length)
              .map((c) => (
                <Card key={c.id} card={c} small />
              ))}
          </div>
          <p className="text-xl font-black text-[#c49a3c] mt-1">
            {stage === 'count_me' ? myCount : myHouse.length}
            <span className="text-xs">匹</span>
          </p>
        </div>
      )}

      {stage === 'announce' && (
        <>
          <p
            className="text-2xl font-black"
            style={{ color: isDraw ? '#9a8776' : iWon ? '#6fcf73' : '#c0392b' }}
          >
            {isDraw ? 'ひきわけ！' : iWon ? 'きみの かち！🎉' : 'あいての かち…😿'}
          </p>
          <button onClick={finishJudging} className="game-btn game-btn-gold">
            けっかをみる
          </button>
        </>
      )}
    </div>
  );
}
