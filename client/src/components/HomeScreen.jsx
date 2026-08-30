import { useState } from 'react';
import { socket } from './SocketManager';
import { useGameStore } from '../store/gameStore';
import { RulesButton } from './RulesButton';

export function HomeScreen() {
  const [joinCode, setJoinCode] = useState('');
  const connected = useGameStore((s) => s.connected);

  const createRoom = () => socket.emit('create_room');
  const createCpuRoom = () => socket.emit('create_cpu_room');
  const joinRoom = () => {
    if (!joinCode.trim()) return;
    socket.emit('join_room', { roomCode: joinCode.trim().toUpperCase() });
  };

  return (
    <div className="max-w-xs mx-auto p-6 flex flex-col gap-4 text-center pt-16">
      <div className="mb-4">
        <div className="text-5xl mb-3">🐱</div>
        <h1 className="game-title text-2xl">うちねこカードゲーム</h1>
        <p className="text-[11px] mt-2" style={{ color: '#7a6a5a' }}>
          {connected ? '接続OK' : '接続中…'}
        </p>
      </div>

      <RulesButton />

      <button onClick={createRoom} disabled={!connected} className="game-btn game-btn-primary">
        ルームをつくる
      </button>

      <button onClick={createCpuRoom} disabled={!connected} className="game-btn game-btn-purple">
        CPUとあそぶ
      </button>

      <div className="flex flex-col gap-2 mt-1">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="ルームコード"
          maxLength={6}
          className="py-3 px-4 rounded-2xl text-center tracking-widest uppercase font-bold text-lg bg-[#231c17] border border-[#3a2e28] text-[#c49a3c] placeholder-[#5a4a3a]"
        />
        <button onClick={joinRoom} disabled={!connected || !joinCode.trim()} className="game-btn game-btn-gold">
          ルームに参加
        </button>
      </div>
    </div>
  );
}
