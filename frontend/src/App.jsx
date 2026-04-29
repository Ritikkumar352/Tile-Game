import { useState, useCallback } from 'react'
import useGridStore from './store/gridStore'
import { useStomp } from './hooks/useStomp'
import Header from './components/Header'
import Grid from './components/Grid/Grid'
import JoinModal from './components/Overlay/JoinModal'
import CooldownToast from './components/Overlay/CooldownToast'
import CooldownRing from './components/Overlay/CooldownRing'
import Leaderboard from './components/HUD/Leaderboard'
import { fetchLeaderboard, fetchStats } from './api/client'
import { useEffect } from 'react'

/**
 * App — root layout shell.
 * Wires all phases:
 *   Phase 1 — layout grid, CSS tokens
 *   Phase 2 — JoinModal (shown when player === null)
 *   Phase 3 — Grid + Tile (virtualised, zoom/pan)
 *   Phase 4 — useStomp (activated after player is set)
 *   Phase 5 — Leaderboard, CooldownRing, CooldownToast
 *   Phase 6 — Mobile FAB for sidebar, MiniMap (inside Grid)
 */
export default function App() {
  const player      = useGridStore((s) => s.player)
  const cooldownUntil = useGridStore((s) => s.cooldownUntil)

  // Toast state — shown when cooldown fires
  const [toast, setToast] = useState(null)

  // Derive toast message from cooldownUntil
  const showCooldown = useCallback((ms) => {
    const secs = Math.ceil(ms / 1000)
    setToast(`Wait ${secs}s`)
  }, [])

  // Connect STOMP only after player has joined
  useStomp(!!player)

  // Mobile sidebar toggle (< 480px: FAB)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const setLeaderboard = useGridStore((s) => s.setLeaderboard)
  const setOnlineCount = useGridStore((s) => s.setOnlineCount)

  // Fetch initial state once joined
  useEffect(() => {
    if (player) {
      fetchLeaderboard().then((data) => setLeaderboard(data.leaderboard))
      fetchStats().then((data) => setOnlineCount(data.onlineCount))
    }
  }, [player, setLeaderboard, setOnlineCount])

  return (
    <>
      {/* ── JoinModal — blocks all interaction until joined ─────────── */}
      {!player && <JoinModal />}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <Header />

      {/* ── Grid — virtualized 50×50 tile grid ──────────────────────── */}
      <main style={{ gridArea: 'grid', position: 'relative', overflow: 'hidden' }}>
        {player ? (
          <Grid />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Join to see the grid
          </div>
        )}
      </main>

      {/* ── Sidebar — Leaderboard ────────────────────────────────────── */}
      <aside
        id="gw-sidebar"
        style={{
          gridArea: 'sidebar',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          overflowY: 'auto',
          /* Mobile < 480px: toggled by FAB */
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Leaderboard />
      </aside>

      {/* ── Mobile FAB — opens sidebar on < 480px ───────────────────── */}
      <button
        id="gw-sidebar-fab"
        aria-label="Toggle leaderboard"
        onClick={() => setSidebarOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: '1.25rem',
          left: '1.25rem',
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          display: 'none', // hidden by default; shown via media query in CSS
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          boxShadow: '0 4px 16px rgba(108,99,255,0.4)',
        }}
      >
        🏆
      </button>

      {/* ── Cooldown Ring — follows cursor ───────────────────────────── */}
      <CooldownRing />

      {/* ── Cooldown Toast ───────────────────────────────────────────── */}
      {toast && (
        <CooldownToast
          message={toast}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  )
}
