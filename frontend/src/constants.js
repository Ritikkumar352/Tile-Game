// Matches backend: app.cooldown-ms: ${CAPTURE_COOLDOWN_MS:3000}
export const CAPTURE_COOLDOWN_MS = 3000

export const GRID_SIZE = 50
export const TILE_SIZE = 14 // px — matches --tile-size CSS token
export const TILE_GAP = 1  // px — matches --tile-gap CSS token
export const TILE_STEP = TILE_SIZE + TILE_GAP // 15px per cell

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,24}$/

export const PRESET_COLORS = [
  '#6c63ff', '#ff6584', '#00d4aa', '#ffd166',
  '#06d6a0', '#ef476f', '#118ab2', '#073b4c',
  '#f8961e', '#90be6d', '#577590', '#f94144',
]

export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 4.0
export const ZOOM_STEP = 0.25
