import { memo, useState, useRef, useCallback, useEffect } from 'react'
import { TILE_SIZE, TILE_GAP } from '../../constants'

/**
 * Tile — FRONTEND_SPEC §3.4
 *
 * - Uses .tile CSS class defined in index.css (never inline)
 * - Background color set via --tile-bg CSS variable (fallback --tile-empty)
 * - Owner initial shown only when zoom >= 2
 * - Hover tooltip: owner name + relative time, appears after 300ms hover
 * - role="button", aria-label, responds to Enter/Space
 * - capture-flash animation via .tile--flash class
 */
const Tile = memo(function Tile({ tile, top, left, zoom, isFlashing, isMine, onCapture }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPos,  setTooltipPos]  = useState({ x: 0, y: 0 })
  const hoverTimer = useRef(null)

  const handleMouseEnter = useCallback((e) => {
    if (!tile?.ownerName) return
    const { clientX, clientY } = e
    hoverTimer.current = setTimeout(() => {
      setTooltipPos({ x: clientX, y: clientY })
      setShowTooltip(true)
    }, 300)
  }, [tile?.ownerName])

  const handleMouseLeave = useCallback(() => {
    clearTimeout(hoverTimer.current)
    setShowTooltip(false)
  }, [])

  useEffect(() => () => clearTimeout(hoverTimer.current), [])

  const handleClick = useCallback(() => {
    onCapture(tile.id)
  }, [onCapture, tile.id])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCapture(tile.id)
    }
  }, [onCapture, tile.id])

  const showInitial = zoom >= 2 && tile?.ownerName
  const initial     = showInitial ? tile.ownerName[0].toUpperCase() : null
  const timeAgo     = tile?.capturedAt ? getTimeAgo(tile.capturedAt) : null

  // className composition
  const classes = [
    'tile',
    isMine      ? 'tile--mine'  : '',
    isFlashing  ? 'tile--flash' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <div
        className={classes}
        role="button"
        tabIndex={0}
        aria-label={`Tile row ${tile.row} col ${tile.col}${tile.ownerName ? ` owned by ${tile.ownerName}` : ''}`}
        style={{
          top:  `${top}px`,
          left: `${left}px`,
          width:  `${TILE_SIZE}px`,
          height: `${TILE_SIZE}px`,
          // Background via CSS custom property so it never hardcodes a color in JSX
          '--tile-bg': tile?.ownerColor ?? 'var(--tile-empty)',
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {initial}
      </div>

      {/* Tooltip — rendered at fixed viewport position */}
      {showTooltip && tile?.ownerName && (
        <div
          className="tile-tooltip"
          style={{
            left: `${tooltipPos.x + 12}px`,
            top:  `${tooltipPos.y - 32}px`,
          }}
        >
          <span style={{ fontWeight: 600, color: tile.ownerColor }}>{tile.ownerName}</span>
          {timeAgo && (
            <span style={{ color: 'var(--muted)', marginLeft: '6px' }}>{timeAgo}</span>
          )}
        </div>
      )}
    </>
  )
}, tileAreEqual)

/** Custom memo comparator — skip re-render if nothing visual changed */
function tileAreEqual(prev, next) {
  return (
    prev.tile?.ownerColor === next.tile?.ownerColor &&
    prev.tile?.ownerId    === next.tile?.ownerId    &&
    prev.top              === next.top              &&
    prev.left             === next.left             &&
    prev.zoom             === next.zoom             &&
    prev.isFlashing       === next.isFlashing       &&
    prev.isMine           === next.isMine
  )
}

/** Relative time string — "2m ago", "just now", etc. */
function getTimeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const s = Math.floor(diffMs / 1000)
  if (s < 10)  return 'just now'
  if (s < 60)  return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

export default Tile
