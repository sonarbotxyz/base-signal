-- Self-service sponsored spots system
ALTER TABLE sponsored_spots ADD COLUMN IF NOT EXISTS booked_by TEXT;
ALTER TABLE sponsored_spots ADD COLUMN IF NOT EXISTS tx_hash TEXT;
ALTER TABLE sponsored_spots ADD COLUMN IF NOT EXISTS payment_token TEXT DEFAULT 'USDC';
ALTER TABLE sponsored_spots ADD COLUMN IF NOT EXISTS payment_amount NUMERIC;
ALTER TABLE sponsored_spots ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMPTZ;
ALTER TABLE sponsored_spots ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';
ALTER TABLE sponsored_spots ADD COLUMN IF NOT EXISTS week_start DATE;
ALTER TABLE sponsored_spots ADD COLUMN IF NOT EXISTS week_end DATE;
