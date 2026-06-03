-- ============================================================
--  2960 AGENCY — GAMIFICATION MIGRATION
--  Run in Neon SQL console
-- ============================================================

-- ════════════════════════════════════════
--  1. ALTER creators — add gamification columns
-- ════════════════════════════════════════

ALTER TABLE creators ADD COLUMN IF NOT EXISTS points_total INTEGER NOT NULL DEFAULT 0;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'bronze';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS unique_restaurants INTEGER NOT NULL DEFAULT 0;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS credits_current INTEGER NOT NULL DEFAULT 3;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS credits_reset_month DATE;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS serial_cancels_month INTEGER NOT NULL DEFAULT 0;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS serial_cancel_blocked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS level_grace_expires_at TIMESTAMPTZ;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
-- tiktok_username and instagram_username already exist

-- ════════════════════════════════════════
--  2. ALTER bookings — add video tracking columns
-- ════════════════════════════════════════

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS video_verified_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS video_deadline TIMESTAMPTZ;
-- post_submitted_at already exists

-- ════════════════════════════════════════
--  3. ALTER restaurants — add tier column
-- ════════════════════════════════════════

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'standard';
-- values: 'standard' | 'premium' | 'exclusive'
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS available_from TIMESTAMPTZ;
-- early access: when the offer becomes visible (null = immediately visible to all)

-- ════════════════════════════════════════
--  4. CREATE points_transactions table
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS points_transactions (
  id          SERIAL PRIMARY KEY,
  creator_id  INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  delta       INTEGER NOT NULL,
  booking_id  INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_tx_creator ON points_transactions(creator_id);
CREATE INDEX IF NOT EXISTS idx_points_tx_created ON points_transactions(created_at DESC);

-- ════════════════════════════════════════
--  5. ALTER reviews — add gamification fields
-- ════════════════════════════════════════

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_auto BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS disputed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
-- existing columns: id, created_at, booking_id, reviewer_type, reviewer_id, rating, comment

-- ════════════════════════════════════════
--  6. CREATE referrals table
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS referrals (
  id                      SERIAL PRIMARY KEY,
  code                    VARCHAR(12) NOT NULL,
  creator_id              INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  restaurant_id           INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  restaurant_published_at TIMESTAMPTZ,
  bonus_paid_at           TIMESTAMPTZ,
  UNIQUE(restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_creator ON referrals(creator_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);

-- ════════════════════════════════════════
--  7. Backfill unique_restaurants for existing creators
-- ════════════════════════════════════════

UPDATE creators c SET unique_restaurants = (
  SELECT COUNT(DISTINCT b.restaurant_id)
  FROM bookings b
  WHERE b.creator_id = c.id AND b.status = 'confirmed'
);

-- ════════════════════════════════════════
--  8. Migrate existing ambassador referrals to referrals table
-- ════════════════════════════════════════

INSERT INTO referrals (code, creator_id, restaurant_id, created_at, restaurant_published_at)
SELECT
  c.ambassador_code,
  c.id,
  r.id,
  r.created_at,
  CASE WHEN r.is_published THEN r.created_at ELSE NULL END
FROM restaurants r
JOIN creators c ON r.referred_by_code = c.ambassador_code
ON CONFLICT (restaurant_id) DO NOTHING;

-- ════════════════════════════════════════
--  9. Push tokens table (for mobile push notifications)
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS push_tokens (
  id              SERIAL PRIMARY KEY,
  token           TEXT UNIQUE NOT NULL,
  platform        TEXT NOT NULL,
  recipient_type  TEXT NOT NULL,
  recipient_id    INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_recipient ON push_tokens(recipient_type, recipient_id);
