import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { translateErrorCode } from '../data/errorMessages';

const socketURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// eslint-disable-next-line react-refresh/only-export-components
export const socket = io(socketURL, {
    autoConnect: false
});

export const SocketManager = () => {
    const {
        setConnected,
        setRoomCode,
        setMyIndex,
        setPhase,
        setView,
        setLastActionResult,
        setGameOverInfo,
        setError,
        setOpponentLeft,
        clearSelection,
    } = useGameStore();

    useEffect(() => {
        socket.connect();

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        const onRoomCreated = ({ roomCode }) => {
            setRoomCode(roomCode);
            setMyIndex(0);
            setPhase('lobby');
        };

        const onRoomJoined = ({ roomCode, myIndex }) => {
            setRoomCode(roomCode);
            setMyIndex(myIndex);
            setPhase('lobby');
        };

        const onOpponentJoined = () => {
            // 直後にgame_start/state_updateが届くため、ここでは特別な処理は不要
        };

        const onGameStart = () => {
            // phaseの実体はstate_updateのview.phaseに委ねる
        };

        const onStateUpdate = (view) => {
            setView(view);
            if (view.phase !== 'finished') {
                setPhase(view.phase);
            }
            clearSelection();
        };

        const onActionResult = (result) => {
            setLastActionResult(result);
        };

        const onErrorEvent = ({ code }) => {
            setError(translateErrorCode(code));
        };

        const onGameOver = (info) => {
            setGameOverInfo(info);
        };

        const onOpponentLeft = () => {
            setOpponentLeft(true);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('room_created', onRoomCreated);
        socket.on('room_joined', onRoomJoined);
        socket.on('opponent_joined', onOpponentJoined);
        socket.on('game_start', onGameStart);
        socket.on('state_update', onStateUpdate);
        socket.on('action_result', onActionResult);
        socket.on('error', onErrorEvent);
        socket.on('game_over', onGameOver);
        socket.on('opponent_left', onOpponentLeft);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('room_created', onRoomCreated);
            socket.off('room_joined', onRoomJoined);
            socket.off('opponent_joined', onOpponentJoined);
            socket.off('game_start', onGameStart);
            socket.off('state_update', onStateUpdate);
            socket.off('action_result', onActionResult);
            socket.off('error', onErrorEvent);
            socket.off('game_over', onGameOver);
            socket.off('opponent_left', onOpponentLeft);
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};
