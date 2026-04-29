import { useState, useEffect, useRef, useCallback } from 'react'
import { useSpring, animated } from 'react-spring'
import useGridStore from '../../store/gridStore'
import { CAPTURE_COOLDOWN_MS } from '../../constants'

const RADIUS      = 18
const STROKE_W    = 3
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SVG_SIZE    = (RADIUS + STROKE_W + 4) * 2

/**
 * CooldownRing — FRONTEND_SPEC §3.6
 * - SVG circle follows cursor, position: fixed, pointer-events: none
 * - stroke-dashoffset animates 0→circumference over CAPTURE_COOLDOWN_MS
 * - Color: --accent2, stroke-width 3px, radius 18px
 * - Disappears when cooldown expires
 */
export default function CooldownRing() {
  const cooldownUntil = useGridStore((s) => s.cooldownUntil)
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const rafRef = useRef(null)
  const rawPos = useRef({ x: -200, y: -200 })

  // Track cursor with rAF for 60fps performance
  const handleMouseMove = useCallback((e) => {
    rawPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    const tick = () => {
      setPos({ ...rawPos.current })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [handleMouseMove])

  const isActive = cooldownUntil && Date.now() < cooldownUntil
  const remaining = isActive ? Math.max(0, cooldownUntil - Date.now()) : 0

  // Animate stroke-dashoffset: 0 (full ring) → CIRCUMFERENCE (empty ring)
  const { dashOffset } = useSpring({
    dashOffset: isActive ? CIRCUMFERENCE : 0,
    from:       { dashOffset: 0 },
    config:     { duration: remaining || CAPTURE_COOLDOWN_MS },
    reset:      isActive,
  })

  if (!isActive) return null

  return (
    <animated.svg
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 999,
        left: pos.x - SVG_SIZE / 2,
        top:  pos.y - SVG_SIZE / 2,
        width:  SVG_SIZE,
        height: SVG_SIZE,
        overflow: 'visible',
      }}
    >
      {/* Background track */}
      <circle
        cx={SVG_SIZE / 2}
        cy={SVG_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="rgba(0,212,170,0.15)"
        strokeWidth={STROKE_W}
      />
      {/* Animated fill ring */}
      <animated.circle
        cx={SVG_SIZE / 2}
        cy={SVG_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--accent2)"
        strokeWidth={STROKE_W}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </animated.svg>
  )
}
