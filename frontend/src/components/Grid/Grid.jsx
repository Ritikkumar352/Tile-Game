import { useState, useCallback, useRef, useEffect, memo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import useGridStore from '../../store/gridStore'
import { useGrid } from '../../hooks/useGrid'
import Tile from './Tile'
import MiniMap from './MiniMap'
import {
  TILE_SIZE, TILE_GAP, TILE_STEP,
  ZOOM_MIN, ZOOM_MAX, ZOOM_STEP,
  CAPTURE_COOLDOWN_MS,
} from '../../constants'
import { captureTile } from '../../api/client'

/**
 * Grid — FRONTEND_SPEC §3.3
 *
 * - @tanstack/react-virtual: virtualises BOTH rows and columns
 * - overscan: 5 rows + 5 cols
 * - Outer: overflow auto, touch-action none
 * - Inner: position relative, exact pixel dimensions 50*(14+1) = 750px
 * - Zoom: CSS transform scale (0.5–4.0, step 0.25), mouse wheel
 * - Pan: translate3d on inner container, mouse drag + touch
 * - transform-origin: 0 0 — offsets calculated manually
 * - will-change: transform for 60fps
 */
const Grid = memo(function Grid() {
  const gridSize   = useGridStore((s) => s.gridSize)
  const tiles      = useGridStore((s) => s.tiles)
  const player     = useGridStore((s) => s.player)
  const setTile    = useGridStore((s) => s.setTile)
  const setCooldown = useGridStore((s) => s.setCooldown)
  const cooldownUntil = useGridStore((s) => s.cooldownUntil)

  // Fetch initial grid state
  const { isLoading, isError } = useGrid()

  // ── Zoom + Pan state ────────────────────────────────────────────────
  const [scale,   setScale]   = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const dragging   = useRef(false)
  const dragStart  = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
  const outerRef   = useRef(null)
  const containerRef = useRef(null)

  // ── Flash state: tileId → timestamp (for capture-flash CSS class) ──
  const [flashIds, setFlashIds] = useState({})

  // ── Virtualizer: rows ───────────────────────────────────────────────
  const rowVirt = useVirtualizer({
    count:        gridSize,
    getScrollElement: () => outerRef.current,
    estimateSize: () => TILE_STEP,
    overscan:     5,
  })

  // ── Virtualizer: cols ───────────────────────────────────────────────
  const colVirt = useVirtualizer({
    count:        gridSize,
    getScrollElement: () => outerRef.current,
    estimateSize: () => TILE_STEP,
    overscan:     5,
    horizontal:   true,
  })

  const totalSize = gridSize * TILE_STEP // 750px

  // ── Mouse wheel zoom ────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault()

    // Pointer position relative to the outer container
    const rect = outerRef.current.getBoundingClientRect()
    const ptrX  = e.clientX - rect.left
    const ptrY  = e.clientY - rect.top

    setScale((prev) => {
      const delta    = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
      const next     = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev + delta))
      const ratio    = next / prev

      // Adjust offsets so zoom is centred on pointer (transform-origin: 0 0)
      setOffsetX((ox) => ptrX - ratio * (ptrX - ox))
      setOffsetY((oy) => ptrY - ratio * (ptrY - oy))

      return next
    })
  }, [])

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // ── Pan — mouse drag ────────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    dragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY }
    e.currentTarget.style.cursor = 'grabbing'
  }, [offsetX, offsetY])

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setOffsetX(dragStart.current.ox + dx)
    setOffsetY(dragStart.current.oy + dy)
  }, [])

  const handleMouseUp = useCallback((e) => {
    dragging.current = false
    e.currentTarget.style.cursor = 'grab'
  }, [])

  // ── Touch pan ───────────────────────────────────────────────────────
  const touchRef = useRef(null)
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: offsetX, oy: offsetY }
    }
  }, [offsetX, offsetY])

  const handleTouchMove = useCallback((e) => {
    if (!touchRef.current || e.touches.length !== 1) return
    e.preventDefault()
    const dx = e.touches[0].clientX - touchRef.current.x
    const dy = e.touches[0].clientY - touchRef.current.y
    setOffsetX(touchRef.current.ox + dx)
    setOffsetY(touchRef.current.oy + dy)
  }, [])

  // ── Tile capture ────────────────────────────────────────────────────
  const handleCapture = useCallback(async (tileId) => {
    if (!player) return
    const now = Date.now()
    if (cooldownUntil && now < cooldownUntil) {
      // Show cooldown error — handled by CooldownToast in Phase 5
      return
    }

    // Optimistic update
    const prev = tiles[tileId]
    const optimistic = {
      ...prev,
      ownerId:    player.id,
      ownerName:  player.username,
      ownerColor: player.color,
      capturedAt: new Date().toISOString(),
    }
    setTile(optimistic)

    // Flash animation
    setFlashIds((f) => ({ ...f, [tileId]: Date.now() }))
    setTimeout(() => {
      setFlashIds((f) => { const n = { ...f }; delete n[tileId]; return n })
    }, 400)

    try {
      const updated = await captureTile(tileId)
      setTile(updated)
    } catch (err) {
      // Revert optimistic update
      if (prev) setTile(prev)
      if (err.status === 429 && err.body?.remainingMs) {
        setCooldown(err.body.remainingMs)
      }
    }
  }, [player, cooldownUntil, tiles, setTile, setCooldown])

  // ── Loading / Error states ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{
        gridArea: 'grid', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg)',
        color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '14px',
      }}>
        Loading grid…
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{
        gridArea: 'grid', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg)',
        color: '#ef476f', fontFamily: 'var(--font-mono)', fontSize: '14px',
      }}>
        Failed to load grid. Check backend connection.
      </div>
    )
  }

  const visibleRows = rowVirt.getVirtualItems()
  const visibleCols = colVirt.getVirtualItems()

  return (
    <div style={{ gridArea: 'grid', position: 'relative', overflow: 'hidden', background: 'var(--bg)', width: '100%', height: '100%' }}>
      {/* Outer scroll / event container */}
      <div
        ref={outerRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          touchAction: 'none',
          cursor: 'grab',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { touchRef.current = null }}
      >
        {/* Inner: CSS-transformed container — transform-origin: 0 0 */}
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width:  totalSize,
            height: totalSize,
            transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {/* Render only visible (row, col) combinations */}
          {visibleRows.map((vRow) =>
            visibleCols.map((vCol) => {
              const tileId = vRow.index * gridSize + vCol.index
              const tile   = tiles[tileId]
              return (
                <Tile
                  key={tileId}
                  tile={tile ?? { id: tileId, row: vRow.index, col: vCol.index, ownerId: null, ownerName: null, ownerColor: null, capturedAt: null }}
                  top={vRow.start}
                  left={vCol.start}
                  zoom={scale}
                  isFlashing={!!flashIds[tileId]}
                  isMine={tile?.ownerId === player?.id}
                  onCapture={handleCapture}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Mini-map — Phase 6 */}
      <MiniMap offsetX={offsetX} offsetY={offsetY} scale={scale} />
    </div>
  )
})

export default Grid
