import { useState } from 'react';

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h4 className="text-xs font-bold text-[#c49a3c] mb-1">{title}</h4>
      <div className="text-sm leading-relaxed space-y-1 text-[#9a8776]">{children}</div>
    </div>
  );
}

export function RulesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="game-btn game-btn-neutral">
        あそびかた
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#c49a3c]">あそびかた</h3>
              <button onClick={() => setOpen(false)} className="text-xs font-bold text-[#7a6a5a] underline cursor-pointer">
                とじる
              </button>
            </div>

            <Section title="もくてき">
              <p>カードで「やく」をつくって、ねこをハウスにあつめよう。8ターンおわったとき、ハウスのねこがおおい方のかち！</p>
            </Section>

            <Section title="4つのエリア">
              <p>🐾 やまふだ：じぶん用のカードのやま（32枚）</p>
              <p>🀄 ばふだ：おもてむきの4枚。やくのざいりょう</p>
              <p>🤲 てふだ：じぶんだけみえる4〜5枚</p>
              <p>🏠 ハウス：やくがせいりつしたカードをおくとくてんエリア</p>
            </Section>

            <Section title="じゅんび">
              <p>①32枚シャッフルして8枚ひく → ②4枚をばふだにする → ③じゃんけんでせんこう・こうこうをきめる</p>
            </Section>

            <Section title="ターンのながれ">
              <p>①やまふだから1枚ひく</p>
              <p>②てふだ1枚＋ばふだでやくをつくる</p>
              <p>・せいりつ → つかったカードをハウスへ。ばふだを4枚にほじゅう</p>
              <p>・できない → パス</p>
              <p>③あいてにこうたい</p>
            </Section>

            <Section title="やくのしゅるい">
              <p>あるあるやく（2枚）／きゅんきゅんやく（3枚、大集会のみ5枚）／ペアやく（おなじぞくせい2枚）</p>
              <p>⭐ オールマイティはどのぞくせいにもなれるよ</p>
            </Section>

            <Section title="とくしゅカード">
              <p>💨 だっそう：5枚つかって、あいてのハウスをからにする</p>
              <p>🎲 きまぐれ：2枚つかって、あいてのばふだを1枚もどす</p>
            </Section>

            <Section title="けっちゃく">
              <p>8ターンでどうてんならサドンデス。さがつくまでくりかえすよ</p>
            </Section>
          </div>
        </div>
      )}
    </>
  );
}
