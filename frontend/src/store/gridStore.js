import { create } from 'zustand'

/**
 * Zustand store — EXACT shape from FRONTEND_SPEC §4.
 * Nothing added, nothing removed.
 */
const useGridStore = create((set) => ({
  // ── State ──────────────────────────────────────────────────────────────
  tiles: {},           // Record<number, TileDto>
  gridSize: 50,
  player: null,        // UserDto | null
  cooldownUntil: null, // ms timestamp | null
  onlineCount: 0,
  leaderboard: [],
  stompStatus: 'disconnected', // 'connected' | 'reconnecting' | 'disconnected'

  // ── Actions ────────────────────────────────────────────────────────────
  setTile: (t) => set((s) => ({ tiles: { ...s.tiles, [t.id]: t } })),

  setGrid: (arr) => set({ tiles: Object.fromEntries(arr.map((t) => [t.id, t])) }),

  setPlayer: (p) => set({ player: p }),

  setOnlineCount: (n) => set({ onlineCount: n }),

  setLeaderboard: (lb) => set({ leaderboard: lb }),

  setStompStatus: (s) => set({ stompStatus: s }),

  setCooldown: (ms) => set({ cooldownUntil: Date.now() + ms }),
}))

export default useGridStore
