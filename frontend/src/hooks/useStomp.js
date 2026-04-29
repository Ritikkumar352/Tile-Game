import { useRef, useEffect, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import useGridStore from '../store/gridStore'

/**
 * useStomp — FRONTEND_SPEC §5
 *
 * Manages the complete STOMP lifecycle:
 * 1. Creates Client with webSocketFactory: () => new SockJS('/ws')
 * 2. Exponential backoff: 1s→2s→4s→8s→16s, cap 30s
 * 3. onConnect: setStompStatus('connected')
 *    - subscribe /topic/tiles        → setTile(msg.payload.tile)
 *    - subscribe /topic/online       → setOnlineCount(msg.payload.count)
 *    - subscribe /topic/leaderboard  → setLeaderboard(msg.payload.leaderboard)
 *    - subscribe /user/queue/errors  → COOLDOWN → setCooldown | ERROR → store
 * 4. onDisconnect: setStompStatus('reconnecting')
 * 5. client.activate() on mount, client.deactivate() on unmount
 *
 * STOMP Client lives in a ref — NEVER stored in React state.
 */
export function useStomp(enabled = true) {
  const clientRef = useRef(null)
  const attemptRef = useRef(0)

  const setTile        = useGridStore((s) => s.setTile)
  const setOnlineCount = useGridStore((s) => s.setOnlineCount)
  const setLeaderboard = useGridStore((s) => s.setLeaderboard)
  const setStompStatus = useGridStore((s) => s.setStompStatus)
  const setCooldown    = useGridStore((s) => s.setCooldown)

  // Exponential backoff delays (ms): 1→2→4→8→16, cap 30s
  const getBackoffDelay = useCallback(() => {
    const delays = [1000, 2000, 4000, 8000, 16000]
    const delay  = delays[Math.min(attemptRef.current, delays.length - 1)]
    return Math.min(delay, 30_000)
  }, [])

  const parseMessage = useCallback((rawBody) => {
    try {
      return JSON.parse(rawBody)
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const client = new Client({
      // Relative path — SockJS handles the HTTP fallback
      webSocketFactory: () => new SockJS('/ws'),

      reconnectDelay: getBackoffDelay(),

      onConnect: () => {
        attemptRef.current = 0 // reset backoff on successful connect
        setStompStatus('connected')

        // ── /topic/tiles ────────────────────────────────────────────
        client.subscribe('/topic/tiles', (frame) => {
          const msg = parseMessage(frame.body)
          if (msg?.type === 'TILE_UPDATED' && msg.payload?.tile) {
            setTile(msg.payload.tile)
          }
        })

        // ── /topic/online ───────────────────────────────────────────
        client.subscribe('/topic/online', (frame) => {
          const msg = parseMessage(frame.body)
          if (msg?.type === 'ONLINE_COUNT' && msg.payload?.count != null) {
            setOnlineCount(msg.payload.count)
          }
        })

        // ── /topic/leaderboard ──────────────────────────────────────
        client.subscribe('/topic/leaderboard', (frame) => {
          const msg = parseMessage(frame.body)
          if (msg?.type === 'LEADERBOARD_UPDATE' && msg.payload?.leaderboard) {
            setLeaderboard(msg.payload.leaderboard)
          }
        })

        // ── /user/queue/errors ──────────────────────────────────────
        client.subscribe('/user/queue/errors', (frame) => {
          const msg = parseMessage(frame.body)
          if (!msg) return
          if (msg.type === 'COOLDOWN' && msg.payload?.remainingMs != null) {
            setCooldown(msg.payload.remainingMs)
          }
          // ERROR type — stompStatus stays connected, UI can surface via store
        })
      },

      onDisconnect: () => {
        setStompStatus('reconnecting')
        attemptRef.current += 1
        // Update reconnectDelay for next attempt
        client.reconnectDelay = getBackoffDelay()
      },

      onStompError: () => {
        setStompStatus('disconnected')
      },

      onWebSocketClose: () => {
        setStompStatus('reconnecting')
        attemptRef.current += 1
        client.reconnectDelay = getBackoffDelay()
      },
    })

    clientRef.current = client
    client.activate()

    return () => {
      client.deactivate()
      clientRef.current = null
      setStompStatus('disconnected')
    }
  }, [enabled, getBackoffDelay, parseMessage, setTile, setOnlineCount, setLeaderboard, setStompStatus, setCooldown])

  return clientRef
}
