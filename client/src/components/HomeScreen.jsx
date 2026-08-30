import { useState } from 'react';
import { socket } from './SocketManager';
import { useGameStore } from '../store/gameStore';

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
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-6 text-center">
      <h1 className="text-2xl font-bold">🐱 うちねこカードゲーム</h1>
      <p className="text-xs text-slate-400">{connected ? 'サーバーに接続済み' : 'サーバーに接続中…'}</p>

      <button
        onClick={createRoom}
        disabled={!connected}
        className="py-3 rounded-xl bg-emerald-600 disabled:bg-slate-700 font-bold"
      >
        ルームを作成する
      </button>

      <button
        onClick={createCpuRoom}
        disabled={!connected}
        className="py-3 rounded-xl bg-purple-600 disabled:bg-slate-700 font-bold"
      >
        🤖 CPUと対戦する
      </button>

      <div className="flex flex-col gap-2">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="ルームコードを入力"
          maxLength={6}
          className="py-2 px-3 rounded-lg bg-slate-800 border border-slate-600 text-center tracking-widest uppercase"
        />
        <button
          onClick={joinRoom}
          disabled={!connected || !joinCode.trim()}
          className="py-3 rounded-xl bg-blue-600 disabled:bg-slate-700 font-bold"
        >
          ルームに参加する
        </button>
      </div>
    </div>
  );
}
