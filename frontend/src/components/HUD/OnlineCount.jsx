import useGridStore from '../../store/gridStore'

/**
 * OnlineCount — FRONTEND_SPEC §3.2 (center of header)
 * Green dot + "N online" — reads onlineCount from Zustand
 */
export default function OnlineCount() {
  const onlineCount = useGridStore((s) => s.onlineCount)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--accent2)',
          display: 'inline-block',
          boxShadow: '0 0 6px var(--accent2)',
          animation: 'pulse 2s infinite',
        }}
      />
      <span style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
        <strong style={{ color: 'var(--accent2)' }}>{onlineCount}</strong>
        {' '}online
      </span>
    </div>
  )
}
