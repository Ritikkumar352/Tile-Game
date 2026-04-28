-- Seeds 50×50 = 2500 tiles. Idempotent.
INSERT INTO tiles (id, row, col)
SELECT
    r * 50 + c AS id,
    r AS row,
    c AS col
FROM generate_series(0, 49) AS r
CROSS JOIN generate_series(0, 49) AS c
ON CONFLICT (id) DO NOTHING;
