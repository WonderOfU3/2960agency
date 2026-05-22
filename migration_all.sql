-- ============================================================
-- 2960 Agency — ALL MIGRATIONS (safe to re-run)
-- Copy-paste this entire file into Neon SQL console
-- Uses IF NOT EXISTS / IF NOT EXISTS everywhere
-- ============================================================

-- ────────────────────────────────────────
-- 1. creator_applications: collab_availability
-- ────────────────────────────────────────
ALTER TABLE creator_applications
  ADD COLUMN IF NOT EXISTS collab_availability TEXT[] NOT NULL DEFAULT '{}';

-- ────────────────────────────────────────
-- 2. creator_applications: cloudinary_urls
-- ────────────────────────────────────────
ALTER TABLE creator_applications
  ADD COLUMN IF NOT EXISTS cloudinary_urls TEXT[] DEFAULT '{}';

-- ────────────────────────────────────────
-- 3. business_applications: status
-- ────────────────────────────────────────
ALTER TABLE business_applications
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS business_status_idx ON business_applications(status);

-- ────────────────────────────────────────
-- 4. restaurants: new columns
-- ────────────────────────────────────────
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS subscription TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS included_collabs INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extra_collab_price DECIMAL(10,2) DEFAULT 35.00,
  ADD COLUMN IF NOT EXISTS auto_accept BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS max_people INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS virality_tiers JSONB DEFAULT '[]'::jsonb;

-- ────────────────────────────────────────
-- 5. time_slots: specific_date for one-off slots
-- ────────────────────────────────────────
ALTER TABLE time_slots
  ADD COLUMN IF NOT EXISTS specific_date DATE DEFAULT NULL;

-- ────────────────────────────────────────
-- 6. bookings: calendar sub-slots
-- ────────────────────────────────────────
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS slot_start_time TIME,
  ADD COLUMN IF NOT EXISTS slot_end_time TIME,
  ADD COLUMN IF NOT EXISTS num_people INTEGER DEFAULT 1;

-- ────────────────────────────────────────
-- 7. restaurant_users (account system)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurant_users (
  id                SERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  owner_name        TEXT NOT NULL,
  phone             TEXT NOT NULL,
  business_name     TEXT NOT NULL,
  restaurant_id     INTEGER REFERENCES restaurants(id),
  status            TEXT DEFAULT 'pending_validation',
  application_id    INTEGER REFERENCES business_applications(id)
);

CREATE INDEX IF NOT EXISTS restaurant_users_email_idx ON restaurant_users(email);
CREATE INDEX IF NOT EXISTS restaurant_users_status_idx ON restaurant_users(status);

-- Trigger (safe: DROP first then CREATE)
DROP TRIGGER IF EXISTS update_restaurant_users_updated_at ON restaurant_users;
CREATE TRIGGER update_restaurant_users_updated_at BEFORE UPDATE ON restaurant_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────
-- 8. verification_codes
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verification_codes (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  purpose     TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS verif_email_idx ON verification_codes(email, code);

-- ────────────────────────────────────────
-- 9. collab_usage (subscription billing)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collab_usage (
  id              SERIAL PRIMARY KEY,
  restaurant_id   INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  month           TEXT NOT NULL,
  completed_count INTEGER DEFAULT 0,
  UNIQUE(restaurant_id, month)
);

CREATE INDEX IF NOT EXISTS collab_usage_resto_idx ON collab_usage(restaurant_id);
CREATE INDEX IF NOT EXISTS collab_usage_month_idx ON collab_usage(month);

-- ────────────────────────────────────────
-- 10. messages & conversation_tokens
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id            SERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  booking_id    INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_type   TEXT NOT NULL,
  sender_name   TEXT NOT NULL,
  content       TEXT NOT NULL,
  is_read       BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS conversation_tokens (
  id            SERIAL PRIMARY KEY,
  token         TEXT NOT NULL UNIQUE,
  booking_id    INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_booking_idx ON messages(booking_id);
CREATE INDEX IF NOT EXISTS conv_token_idx ON conversation_tokens(token);
CREATE INDEX IF NOT EXISTS conv_booking_idx ON conversation_tokens(booking_id);

-- ────────────────────────────────────────
-- 11. reviews
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  booking_id    INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_type TEXT NOT NULL,
  reviewer_id   INTEGER NOT NULL,
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  UNIQUE(booking_id, reviewer_type)
);

CREATE INDEX IF NOT EXISTS reviews_booking_idx ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS reviews_creator_idx ON reviews(reviewer_type, reviewer_id);

-- ────────────────────────────────────────
-- 12. notifications
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            SERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  recipient_type TEXT NOT NULL,
  recipient_id   INTEGER NOT NULL,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  link          TEXT,
  read          BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS notif_recipient_idx ON notifications(recipient_type, recipient_id, read);
CREATE INDEX IF NOT EXISTS notif_created_idx ON notifications(created_at DESC);

-- ────────────────────────────────────────
-- 13. bookings: reconfirmation system
-- ────────────────────────────────────────
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS reconfirmed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ DEFAULT NULL;

-- ────────────────────────────────────────
-- 15. Trial system for restaurants
-- ────────────────────────────────────────
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_collabs_used INTEGER DEFAULT 0;

-- ============================================================
-- DONE — All migrations applied
-- ============================================================
