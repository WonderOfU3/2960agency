-- ============================================================
--  2960 AGENCY — ONBOARDING + MOTEUR B MIGRATION
--  Run in Neon SQL console
-- ============================================================

-- ════════════════════════════════════════
--  1. RESTAURANTS — onboarding + niche
-- ════════════════════════════════════════

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS first_published_at TIMESTAMPTZ;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS niche TEXT DEFAULT 'restaurant';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- ════════════════════════════════════════
--  2. RESTAURANT_USERS — tour flag
-- ════════════════════════════════════════

ALTER TABLE restaurant_users ADD COLUMN IF NOT EXISTS onboarding_tour_seen BOOLEAN DEFAULT false;

-- ════════════════════════════════════════
--  3. BUSINESS_APPLICATIONS — niche
-- ════════════════════════════════════════

ALTER TABLE business_applications ADD COLUMN IF NOT EXISTS niche TEXT DEFAULT 'restaurant';

-- ════════════════════════════════════════
--  4. BOOKINGS — prime snapshot + source
-- ════════════════════════════════════════

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booked_virality_tiers JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'organique';

-- ════════════════════════════════════════
--  5. MOTEUR B — push tracking table
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS moteur_b_pushes (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES creators(id),
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  pushed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moteur_b_pushes_creator ON moteur_b_pushes(creator_id, pushed_at);
CREATE INDEX IF NOT EXISTS idx_moteur_b_pushes_restaurant ON moteur_b_pushes(restaurant_id);
