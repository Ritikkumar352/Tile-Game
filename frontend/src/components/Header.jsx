import useGridStore from '../store/gridStore'

/**
 * Header — 56px (FRONTEND_SPEC §3.2)
 * Left:   "GridWar" in --accent, font-weight 800, 22px
 * Center: green dot + "N online"
 * Right:  color swatch + username + connection status dot
 */
export default function Header() {
  const player       = useGridStore((s) => s.player)
  const onlineCount  = useGridStore((s) => s.onlineCount)
  const stompStatus  = useGridStore((s) => s.stompStatus)

  const statusColor = {
    connected:    '#00d4aa',
    reconnecting: '#ffd166',
    disconnected: '#ef476f',
  }[stompStatus] ?? '#ef476f'

  return (
    <header
      style={{
        gridArea: 'header',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        height: '56px',
        zIndex: 10,
      }}
    >
      {/* Left — logo */}
      <span
        style={{
          color: 'var(--accent)',
          fontWeight: 800,
          fontSize: '22px',
          fontFamily: 'var(--font-sans)',
          letterSpacing: '-0.5px',
        }}
      >
        GridWar
      </span>

      {/* Center — online count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent2)',
            display: 'inline-block',
            boxShadow: '0 0 6px var(--accent2)',
          }}
        />
        <span style={{ fontSize: '14px', color: 'var(--text)' }}>
          {onlineCount} online
        </span>
      </div>

      {/* Right — player info + connection dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {player && (
          <>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: player.color,
                border: '2px solid var(--border)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>
              {player.username}
            </span>
          </>
        )}
        {/* Connection status dot */}
        <span
          title={stompStatus}
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: statusColor,
            display: 'inline-block',
            boxShadow: `0 0 6px ${statusColor}`,
            transition: 'background 300ms ease, box-shadow 300ms ease',
          }}
        />
      </div>
    </header>
  )
}
