import { useEffect, useRef } from 'react'
import useGridStore from '../../store/gridStore'
import { GRID_SIZE, TILE_STEP } from '../../constants'

/**
 * MiniMap — FRONTEND_SPEC §3.3 / Phase 6
 * 100×100 canvas, fixed bottom-right.
 * Draws every tile as a proportional pixel, coloured by ownerColor or --tile-empty.
 * Shows a viewport rectangle representing the current zoom/pan window.
 */
export default function MiniMap({ offsetX, offsetY, scale }) {
  const canvasRef  = useRef(null)
  const tiles      = useGridStore((s) => s.tiles)
  const gridSize   = useGridStore((s) => s.gridSize)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 100
    const H = 100
    const cellW = W / gridSize
    const cellH = H / gridSize

    // Clear
    ctx.fillStyle = '#1e1e3a'
    ctx.fillRect(0, 0, W, H)

    // Draw tiles
    for (let id = 0; id < gridSize * gridSize; id++) {
      const tile = tiles[id]
      const row  = Math.floor(id / gridSize)
      const col  = id % gridSize
      ctx.fillStyle = tile?.ownerColor ?? '#1e1e3a'
      ctx.fillRect(
        Math.floor(col * cellW),
        Math.floor(row * cellH),
        Math.max(1, Math.floor(cellW)),
        Math.max(1, Math.floor(cellH))
      )
    }

    // Draw viewport rectangle
    // The outer container size — approximate from canvas parent
    const outerW = canvas.parentElement?.parentElement?.clientWidth  ?? 800
    const outerH = canvas.parentElement?.parentElement?.clientHeight ?? 600

    // In grid-space: how many px of the total grid are visible?
    const visW = outerW / scale
    const visH = outerH / scale
    // Scroll offset in grid-space
    const scrollX = -offsetX / scale
    const scrollY = -offsetY / scale

    const totalSize = gridSize * TILE_STEP

    const rx = (scrollX / totalSize) * W
    const ry = (scrollY / totalSize) * H
    const rw = (visW   / totalSize) * W
    const rh = (visH   / totalSize) * H

    ctx.strokeStyle = 'rgba(108,99,255,0.85)'
    ctx.lineWidth   = 1.5
    ctx.strokeRect(
      Math.max(0, rx),
      Math.max(0, ry),
      Math.min(W - Math.max(0, rx), rw),
      Math.min(H - Math.max(0, ry), rh)
    )
  }, [tiles, gridSize, offsetX, offsetY, scale])

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        width: 100,
        height: 100,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        zIndex: 10,
      }}
    >
      <canvas ref={canvasRef} width={100} height={100} style={{ display: 'block' }} />
    </div>
  )
}
