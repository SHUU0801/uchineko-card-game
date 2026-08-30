import { SocketManager } from './components/SocketManager';
import { useGameStore } from './store/gameStore';
import { HomeScreen } from './components/HomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { SetupScreen } from './components/SetupScreen';
import { JankenScreen } from './components/JankenScreen';
import { Board } from './components/Board';
import { RefereeScreen } from './components/RefereeScreen';
import { GameOverScreen } from './components/GameOverScreen';

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const resultBoardView = useGameStore((s) => s.resultBoardView);

  return (
    <div className="min-h-screen">
      <SocketManager />
      {phase === 'home' && <HomeScreen />}
      {phase === 'lobby' && <LobbyScreen />}
      {phase === 'setup' && <SetupScreen />}
      {(phase === 'janken' || phase === 'janken_choice') && <JankenScreen />}
      {(phase === 'playing' || phase === 'pk') && <Board />}
      {phase === 'judging' && <RefereeScreen />}
      {phase === 'finished' && (resultBoardView ? <Board readOnly /> : <GameOverScreen />)}
    </div>
  );
}
