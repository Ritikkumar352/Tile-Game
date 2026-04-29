import { useState, useCallback } from 'react'
import { useSpring, animated } from 'react-spring'
import { createUser } from '../../api/client'
import useGridStore from '../../store/gridStore'
import { USERNAME_REGEX, PRESET_COLORS } from '../../constants'

/**
 * JoinModal — FRONTEND_SPEC §3.1
 *
 * - Shown on first visit (player === null)
 * - Backdrop blocks rest of UI — CANNOT be dismissed by clicking backdrop
 * - Username: max 24 chars, ^[a-zA-Z0-9_]{3,24}$, min 3 to enable submit
 * - 12 preset color swatches (exact list from spec)
 * - POST /api/users → 200 closes modal + sets player in store
 * - 409 → inline "Username taken" error
 * - Animation: opacity 0→1, scale 0.9→1, 200ms ease-out (react-spring)
 */
export default function JoinModal() {
  const setPlayer = useGridStore((s) => s.setPlayer)

  const [username, setUsername]     = useState('')
  const [color, setColor]           = useState(PRESET_COLORS[0])
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fade + scale animation on mount
  const spring = useSpring({
    from:   { opacity: 0, transform: 'scale(0.9)' },
    to:     { opacity: 1, transform: 'scale(1)' },
    config: { duration: 200, easing: (t) => t * (2 - t) }, // ease-out
  })

  const isValid = USERNAME_REGEX.test(username)

  const handleUsernameChange = useCallback((e) => {
    const val = e.target.value.slice(0, 24) // hard cap at 24 chars
    setUsername(val)
    setError('') // clear error on change
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!isValid || submitting) return

      setSubmitting(true)
      setError('')

      try {
        const user = await createUser(username, color)
        setPlayer(user)
        // useStomp hook (Phase 4) will detect player !== null and connect
      } catch (err) {
        if (err.status === 409) {
          setError('Username taken — try another.')
        } else {
          setError(err.message || 'Something went wrong. Try again.')
        }
      } finally {
        setSubmitting(false)
      }
    },
    [username, color, isValid, submitting, setPlayer]
  )

  return (
    /* Backdrop — click does NOT close the modal */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Join GridWar"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(13, 13, 26, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <animated.div
        style={{
          ...spring,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--accent)',
            fontFamily: 'var(--font-sans)',
            marginBottom: '0.25rem',
          }}
        >
          GridWar
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '1.75rem' }}>
          Claim tiles. Dominate the grid. Outplay everyone.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Username input */}
          <label
            htmlFor="gw-username"
            style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Username
          </label>
          <input
            id="gw-username"
            type="text"
            autoComplete="off"
            autoFocus
            maxLength={24}
            value={username}
            onChange={handleUsernameChange}
            placeholder="e.g. player_42"
            style={{
              width: '100%',
              background: 'var(--bg)',
              border: `1px solid ${error ? '#ef476f' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              color: 'var(--text)',
              fontSize: '15px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              transition: 'border-color 150ms ease',
              marginBottom: '6px',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
            onBlur={(e)  => { e.target.style.borderColor = error ? '#ef476f' : 'var(--border)' }}
          />

          {/* Validation hint */}
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            3–24 characters · letters, numbers, underscore only
          </p>

          {/* Color picker */}
          <label
            style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Your Color
          </label>
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.75rem' }}
            role="radiogroup"
            aria-label="Choose your tile color"
          >
            {PRESET_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                role="radio"
                aria-checked={color === hex}
                aria-label={`Color ${hex}`}
                onClick={() => setColor(hex)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: hex,
                  border: color === hex
                    ? '3px solid var(--text)'
                    : '3px solid transparent',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 120ms ease, transform 120ms ease',
                  transform: color === hex ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: color === hex ? `0 0 0 2px ${hex}55` : 'none',
                }}
              />
            ))}
          </div>

          {/* Inline error */}
          {error && (
            <p
              role="alert"
              style={{
                fontSize: '13px',
                color: '#ef476f',
                marginBottom: '1rem',
                background: 'rgba(239,71,111,0.1)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(239,71,111,0.3)',
              }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            id="gw-join-btn"
            type="submit"
            disabled={!isValid || submitting}
            style={{
              width: '100%',
              padding: '12px',
              background: isValid && !submitting ? 'var(--accent)' : 'var(--border)',
              color: isValid && !submitting ? '#fff' : 'var(--muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
              transition: 'background 200ms ease, transform 100ms ease',
              letterSpacing: '0.03em',
            }}
            onMouseEnter={(e) => { if (isValid && !submitting) e.target.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)' }}
          >
            {submitting ? 'Joining…' : 'Join GridWar'}
          </button>
        </form>
      </animated.div>
    </div>
  )
}
