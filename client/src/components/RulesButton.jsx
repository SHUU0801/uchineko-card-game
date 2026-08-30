import { useState } from 'react';

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h4 className="text-xs font-black mb-1" style={{ color: '#d4a44a' }}>{title}</h4>
      <div className="text-sm leading-relaxed space-y-1" style={{ color: '#c4a882' }}>{children}</div>
    </div>
  );
}

export function RulesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="game-btn game-btn-neutral">
        遊び方
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black" style={{ color: '#f0d68a' }}>遊び方</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-xs font-bold cursor-pointer"
                style={{ color: '#8b7355', textDecoration: 'underline' }}
              >
                閉じる
              </button>
            </div>

            <Section title="目的">
              <p>
                手持ちのカードで「役」を作り、役に使ったねこカードを自分の「ハウス」に集めます。
                8手番（自分4回・相手4回）が終わった時点でハウスのねこが多い方の勝ちです。
              </p>
            </Section>

            <Section title="4つのエリア">
              <p>🐾 山札：伏せられた自分専用のドロー山（32枚）</p>
              <p>🀄 場札：表向きで公開されている4枚。役作りの材料</p>
              <p>🤲 手札：非公開の4〜5枚</p>
              <p>🏠 ハウス：役が成立したカードを置く得点エリア</p>
            </Section>

            <Section title="準備">
              <p>①各自32枚デッキをシャッフルし8枚引く → ②4枚を場札として公開 → ③さいしょはにゃんじゃんけんで勝った方が先攻/後攻を選ぶ</p>
            </Section>

            <Section title="ターンの流れ">
              <p>①山札から1枚引く（手札が一時的に5枚に）</p>
              <p>②手札1枚＋場札で役ができるか試す</p>
              <p>・役が成立 → 使ったカードをハウスへ。場札を4枚に補充</p>
              <p>・成立しない → パス（引いたカードは手札に残る。場札は補充しない）</p>
              <p>③手番を相手に渡す</p>
            </Section>

            <Section title="役の種類（詳細は「役一覧」ボタン）">
              <p>あるある役（2枚）／きゅんきゅん役（3枚、大集会のみ5枚）／ペア役（同じ属性2枚）</p>
              <p>⭐ オールマイティは任意の属性として使える万能カードです</p>
            </Section>

            <Section title="特殊カード">
              <p>💨 だっそう：手札1＋場4の計5枚を使って発動。相手のハウスを空にして相手の山札へ戻す</p>
              <p>🎲 きまぐれ：手札1＋場1の計2枚を使って発動。相手の場札を1枚指定して山札に戻させる（自分のターンのみ使用可）</p>
            </Section>

            <Section title="決着">
              <p>8手番終了時に同数の場合はサドンデス（PK）。両者同時に1枚引き、役ができた分だけハウスに追加（累積）。差がつくまで繰り返します。</p>
            </Section>
          </div>
        </div>
      )}
    </>
  );
}
