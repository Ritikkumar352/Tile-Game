/**
 * API client — all paths are relative (/api/...).
 * NEVER hardcode localhost URLs.
 */

const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include', // send session cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.message || `HTTP ${res.status}`)
    err.status = res.status
    err.code = body.error
    err.body = body
    throw err
  }

  // 204 No Content
  if (res.status === 204) return null
  return res.json()
}

// POST /api/users  → UserDto
export function createUser(username, color) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify({ username, color }),
  })
}

// GET /api/grid  → { grid: TileDto[], size: 50, total: 2500 }
export function fetchGrid() {
  return request('/grid')
}

// PATCH /api/tiles/{id}  → TileDto
export function captureTile(tileId) {
  return request(`/tiles/${tileId}`, { method: 'PATCH' })
}

// GET /api/leaderboard  → { leaderboard: LeaderboardEntry[] }
export function fetchLeaderboard() {
  return request('/leaderboard')
}

// GET /api/stats  → { onlineCount, totalTiles, claimedTiles, unclaimedTiles }
export function fetchStats() {
  return request('/stats')
}
