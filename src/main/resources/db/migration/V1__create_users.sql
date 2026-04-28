CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(24) NOT NULL UNIQUE,
    color CHAR(7) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
