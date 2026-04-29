import { useEffect, useCallback } from 'react'
import { useSpring, animated } from 'react-spring'

/**
 * CooldownToast — FRONTEND_SPEC §3.6
 * - Shown when a capture fails due to cooldown
 * - Text: "Wait Xs" (seconds remaining)
 * - Auto-dismisses after 1.5s
 * - useSpring fade animation
 */
export default function CooldownToast({ message, onDismiss }) {
  const spring = useSpring({
    from:   { opacity: 0, transform: 'translateY(12px) scale(0.95)' },
    to:     { opacity: 1, transform: 'translateY(0px) scale(1)' },
    config: { tension: 320, friction: 24 },
  })

  useEffect(() => {
    const t = setTimeout(onDismiss, 1500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <animated.div
      role="alert"
      aria-live="assertive"
      style={{
        ...spring,
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: spring.transform,
        // Override spring transform to keep translateX(-50%) always applied
        marginLeft: '-50%',
        background: 'rgba(239,71,111,0.15)',
        border: '1px solid rgba(239,71,111,0.4)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 20px',
        color: '#ef476f',
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        zIndex: 500,
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 20px rgba(239,71,111,0.2)',
      }}
    >
      ⏱ {message}
    </animated.div>
  )
}
