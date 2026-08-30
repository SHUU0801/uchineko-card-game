import { create } from 'zustand';

const initialSelection = { handCardId: null, fieldCardIds: [] };

export const useGameStore = create((set) => ({
  connected: false,
  phase: 'home', // 'home' | 'lobby' | 'setup' | 'janken' | 'janken_choice' | 'playing' | 'pk' | 'finished'
  roomCode: null,
  myIndex: null,
  vsCpu: false,
  view: null, // 最後に受け取ったstate_update（自分視点。相手の非公開情報は含まれない）
  selection: { ...initialSelection },
  pendingKimagureTarget: false, // きまぐれの対象選択モードかどうか
  lastActionResult: null,
  lastActionSeq: 0, // アクション結果バナーのアニメーションを毎回再生させるためのカウンタ
  gameOverInfo: null,
  rematchVotes: null, // [自分が再戦を希望したか, 相手が希望したか] ではなくプレイヤーindex順
  errorMessage: null,
  opponentLeft: false,

  setConnected: (connected) => set({ connected }),
  setPhase: (phase) => set({ phase }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setMyIndex: (myIndex) => set({ myIndex }),
  setVsCpu: (vsCpu) => set({ vsCpu }),
  setView: (view) => set({ view }),

  setHandCard: (handCardId) =>
    set((state) => ({ selection: { ...state.selection, handCardId } })),

  toggleFieldCardSelection: (cardId) =>
    set((state) => {
      const exists = state.selection.fieldCardIds.includes(cardId);
      const fieldCardIds = exists
        ? state.selection.fieldCardIds.filter((id) => id !== cardId)
        : [...state.selection.fieldCardIds, cardId];
      return { selection: { ...state.selection, fieldCardIds } };
    }),

  clearSelection: () => set({ selection: { ...initialSelection }, pendingKimagureTarget: false }),

  setPendingKimagureTarget: (flag) => set({ pendingKimagureTarget: flag }),

  setLastActionResult: (result) =>
    set((state) => ({ lastActionResult: result, lastActionSeq: state.lastActionSeq + 1 })),
  setGameOverInfo: (info) => set({ gameOverInfo: info, phase: 'finished', rematchVotes: null }),
  clearGameOverInfo: () => set({ gameOverInfo: null, rematchVotes: null }),
  setRematchVotes: (votes) => set({ rematchVotes: votes }),
  setError: (errorMessage) => set({ errorMessage }),
  clearError: () => set({ errorMessage: null }),
  setOpponentLeft: (opponentLeft) => set({ opponentLeft }),

  reset: () =>
    set({
      phase: 'home',
      roomCode: null,
      myIndex: null,
      vsCpu: false,
      view: null,
      selection: { ...initialSelection },
      pendingKimagureTarget: false,
      lastActionResult: null,
      lastActionSeq: 0,
      gameOverInfo: null,
      rematchVotes: null,
      errorMessage: null,
      opponentLeft: false,
    }),
}));
