import { useRef, useEffect, useState, useCallback } from 'react'
import { useTransition, animated } from 'react-spring'
import useGridStore from '../../store/gridStore'

/**
 * Leaderboard — FRONTEND_SPEC §3.5
 *
 * - Top 10 by tiles owned — live via /topic/leaderboard
 * - Each row: rank, color swatch, username, tile count
 * - Current user row: left border in --accent
 * - Rank change animation: useTransition from react-spring (vertical slide)
 * - Below: stat row — total tiles (2500), claimed %, your tile count
 */
export default function Leaderboard() {
  const leaderboard = useGridStore((s) => s.leaderboard)
  const player      = useGridStore((s) => s.player)
  const tiles       = useGridStore((s) => s.tiles)

  // Stats derived from tiles store
  const totalTiles   = 2500
  const claimedTiles = Object.values(tiles).filter((t) => t?.ownerId).length
  const myTiles      = player
    ? Object.values(tiles).filter((t) => t?.ownerId === player.id).length
    : 0
  const claimedPct   = totalTiles > 0 ? ((claimedTiles / totalTiles) * 100).toFixed(1) : '0.0'

  // react-spring useTransition — animates rank changes (vertical slide)
  const transitions = useTransition(
    leaderboard.map((entry, i) => ({ ...entry, rank: i + 1 })),
    {
      keys:    (item) => item.userId ?? item.username,
      from:    { opacity: 0, transform: 'translateY(-12px)' },
      enter:   { opacity: 1, transform: 'translateY(0px)' },
      update:  { opacity: 1, transform: 'translateY(0px)' },
      leave:   { opacity: 0, transform: 'translateY(12px)' },
      config:  { tension: 300, friction: 28 },
    }
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '0.75rem',
      }}
    >
      {/* Section title */}
      <h2
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '0.75rem',
          fontFamily: 'var(--font-mono)',
        }}
      >
        Leaderboard
      </h2>

      {/* Rows */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {leaderboard.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            Waiting for data…
          </p>
        ) : (
          transitions((style, item) => {
            const isMe = player && item.userId === player.id
            return (
              <animated.div
                key={item.userId ?? item.username}
                style={{
                  ...style,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 8px',
                  marginBottom: '4px',
                  borderRadius: 'var(--radius-sm)',
                  background: isMe ? 'rgba(108,99,255,0.1)' : 'transparent',
                  borderLeft: isMe ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'background 200ms ease',
                }}
              >
                {/* Rank */}
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--muted)',
                    width: '18px',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {item.rank}
                </span>

                {/* Color swatch */}
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: item.color,
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                />

                {/* Username */}
                <span
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    color: isMe ? 'var(--text)' : 'var(--muted)',
                    fontWeight: isMe ? 600 : 400,
                    fontFamily: 'var(--font-sans)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.username}
                </span>

                {/* Tile count */}
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: isMe ? 'var(--accent)' : 'var(--muted)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {item.tileCount ?? 0}
                </span>
              </animated.div>
            )
          })
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)', margin: '0.75rem 0' }} />

      {/* Stats row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <StatRow label="Total tiles"  value={totalTiles.toLocaleString()} />
        <StatRow label="Claimed"      value={`${claimedPct}%`} />
        {player && <StatRow label="Your tiles" value={myTiles} accent />}
      </div>
    </div>
  )
}

function StatRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: accent ? 'var(--accent2)' : 'var(--text)',
        }}
      >
        {value}
      </span>
    </div>
  )
}
