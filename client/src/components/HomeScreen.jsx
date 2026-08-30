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
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-5 text-center pt-12">
      <div className="mb-2">
        <div className="text-5xl mb-2" style={{ filter: 'drop-shadow(0 2px 8px rgba(212,164,74,0.3))' }}>🐱</div>
        <h1 className="game-title">うちねこカードゲーム</h1>
        <p className="text-xs mt-2" style={{ color: '#8b7355' }}>
          {connected ? 'サーバーに接続済み' : 'サーバーに接続中…'}
        </p>
      </div>

      <RulesButton />

      <button
        onClick={createRoom}
        disabled={!connected}
        className="game-btn game-btn-primary"
      >
        ルームを作成する
      </button>

      <button
        onClick={createCpuRoom}
        disabled={!connected}
        className="game-btn game-btn-purple"
      >
        CPUと対戦する
      </button>

      <div className="flex flex-col gap-2">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="ルームコードを入力"
          maxLength={6}
          className="py-3 px-4 rounded-lg text-center tracking-widest uppercase font-bold"
          style={{
            background: 'rgba(13, 8, 6, 0.6)',
            border: '2px solid #5c3d2e',
            color: '#f0d68a',
            fontSize: '18px',
          }}
        />
        <button
          onClick={joinRoom}
          disabled={!connected || !joinCode.trim()}
          className="game-btn game-btn-gold"
        >
          ルームに参加する
        </button>
      </div>
    </div>
  );
}
