import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { translateErrorCode } from '../data/errorMessages';
import { playDrawSound, playYakuSound, playPassSound, playErrorSound, playDassouSound, playKimagureSound } from '../utils/sound';

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
        setVsCpu,
        setPhase,
        setView,
        setLastActionResult,
        startJudging,
        clearGameOverInfo,
        setRematchVotes,
        setError,
        setOpponentLeft,
        clearSelection,
    } = useGameStore();

    const prevHandLengthRef = useRef(null);

    useEffect(() => {
        socket.connect();

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        const onRoomCreated = ({ roomCode, vsCpu }) => {
            setRoomCode(roomCode);
            setMyIndex(0);
            setVsCpu(!!vsCpu);
            if (!vsCpu) setPhase('lobby');
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
            // 自分の手札が増えていたら（ターン開始時のドロー）効果音を鳴らす
            const prevLen = prevHandLengthRef.current;
            if (view.phase === 'playing' && prevLen !== null && view.me.hand.length > prevLen) {
                playDrawSound();
            }
            prevHandLengthRef.current = view.me.hand.length;

            setView(view);
            if (view.phase !== 'finished') {
                setPhase(view.phase);
                clearGameOverInfo();
            }
            clearSelection();
        };

        const onActionResult = (result) => {
            setLastActionResult(result);
            if (result.kind === 'pass') {
                playPassSound();
            } else if (result.kind === 'dassou') {
                playDassouSound();
            } else if (result.kind === 'kimagure') {
                playKimagureSound();
            } else {
                playYakuSound();
            }
        };

        const onErrorEvent = ({ code }) => {
            setError(translateErrorCode(code));
            playErrorSound();
        };

        const onGameOver = (info) => {
            startJudging(info);
        };

        const onOpponentLeft = () => {
            setOpponentLeft(true);
        };

        const onRematchStatus = ({ votes }) => {
            setRematchVotes(votes);
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
        socket.on('rematch_status', onRematchStatus);

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
            socket.off('rematch_status', onRematchStatus);
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};
