CREATE TABLE tiles (
    id INTEGER PRIMARY KEY,
    row SMALLINT NOT NULL,
    col SMALLINT NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    captured_at TIMESTAMPTZ,
    UNIQUE(row, col)
);

CREATE TABLE capture_log (
    id BIGSERIAL PRIMARY KEY,
    tile_id INTEGER NOT NULL REFERENCES tiles(id),
    user_id UUID NOT NULL REFERENCES users(id),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tiles_owner ON tiles(owner_id);
CREATE INDEX idx_caplog_user ON capture_log(user_id);
CREATE INDEX idx_caplog_tile ON capture_log(tile_id);
