-- ============================================================
--  2960 AGENCY — Creator Auth & Booking System Schema
--  Run this in your Neon SQL Editor AFTER running schema.sql
-- ============================================================

-- ────────────────────────────────────────
--  CREATORS (auth users)
-- ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS creators (
  id                SERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  -- Auth info
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  phone             TEXT NOT NULL,

  -- Profile (from creator_applications)
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  tiktok_username   TEXT,
  instagram_username TEXT,
  city              TEXT,

  -- Ambassador program
  ambassador_code   TEXT NOT NULL UNIQUE,
  referral_count    INTEGER DEFAULT 0,
  reward_status     TEXT DEFAULT 'pending', -- 'pending' | 'eligible' | 'paid'

  -- Account status
  status            TEXT DEFAULT 'pending_validation', -- 'pending_validation' | 'active' | 'blocked'

  -- Link to original application
  application_id    INTEGER REFERENCES creator_applications(id)
);

-- ────────────────────────────────────────
--  RESTAURANTS
-- ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS restaurants (
  id                SERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  -- Basic info
  name              TEXT NOT NULL,
  cuisine_type      TEXT NOT NULL,
  address           TEXT NOT NULL,
  city              TEXT NOT NULL,
  arrondissement    TEXT,

  -- Media
  photos            TEXT[] DEFAULT '{}', -- Array of image URLs (Cloudinary)

  -- Offer details
  offer_description TEXT NOT NULL,
  virality_bonus    DECIMAL(10,2), -- Amount in euros (optional)

  -- Slot configuration
  max_bookings_per_week   INTEGER DEFAULT 3,
  max_bookings_per_day    INTEGER DEFAULT 1,

  -- Publishing
  is_published      BOOLEAN DEFAULT false, -- Controls if visible to creators

  -- Link to original business application
  business_application_id INTEGER REFERENCES business_applications(id),

  -- Referral tracking
  referred_by_code  TEXT REFERENCES creators(ambassador_code)
);

-- ────────────────────────────────────────
--  TIME SLOTS
-- ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS time_slots (
  id                SERIAL PRIMARY KEY,
  restaurant_id     INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Time definition
  day_of_week       INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,

  -- Capacity
  max_bookings      INTEGER DEFAULT 1, -- Max creators per slot

  -- Status
  is_active         BOOLEAN DEFAULT true
);

-- ────────────────────────────────────────
--  BOOKINGS
-- ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id                SERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),

  -- Who & Where
  creator_id        INTEGER NOT NULL REFERENCES creators(id),
  restaurant_id     INTEGER NOT NULL REFERENCES restaurants(id),
  time_slot_id      INTEGER NOT NULL REFERENCES time_slots(id),

  -- When
  booking_date      DATE NOT NULL,

  -- Status
  status            TEXT DEFAULT 'confirmed', -- 'confirmed' | 'completed' | 'cancelled'

  -- Notes
  notes             TEXT,

  UNIQUE(creator_id, restaurant_id, booking_date) -- Prevent double booking same resto same day
);

-- ────────────────────────────────────────
--  ADMINS
-- ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admins (
  id                SERIAL PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  name              TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Yara as admin (password: change_this_password_123)
-- You should change this password after first login!
INSERT INTO admins (email, password_hash, name) VALUES
  ('contact@2960agency.com', '$2a$10$xQJ5kP9qZJZ5Z5Z5Z5Z5Z5euKj.lC7M8KXP1DJxF5qP5qP5qP5qP5', 'Yara')
ON CONFLICT (email) DO NOTHING;

-- ────────────────────────────────────────
--  INDEXES
-- ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS creators_email_idx ON creators(email);
CREATE INDEX IF NOT EXISTS creators_ambassador_code_idx ON creators(ambassador_code);
CREATE INDEX IF NOT EXISTS creators_status_idx ON creators(status);

CREATE INDEX IF NOT EXISTS restaurants_published_idx ON restaurants(is_published);
CREATE INDEX IF NOT EXISTS restaurants_referred_by_idx ON restaurants(referred_by_code);

CREATE INDEX IF NOT EXISTS time_slots_restaurant_idx ON time_slots(restaurant_id);
CREATE INDEX IF NOT EXISTS time_slots_day_idx ON time_slots(day_of_week);

CREATE INDEX IF NOT EXISTS bookings_creator_idx ON bookings(creator_id);
CREATE INDEX IF NOT EXISTS bookings_restaurant_idx ON bookings(restaurant_id);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(booking_date);

-- ────────────────────────────────────────
--  UPDATE EXISTING TABLES
-- ────────────────────────────────────────

-- Add ambassador code tracking to business_applications
ALTER TABLE business_applications
  ADD COLUMN IF NOT EXISTS referred_by_ambassador_code TEXT,
  ADD COLUMN IF NOT EXISTS annual_subscription_price DECIMAL(10,2);

-- Add unique index on referred_by_ambassador_code if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'business_referred_by_idx'
  ) THEN
    CREATE INDEX business_referred_by_idx ON business_applications(referred_by_ambassador_code);
  END IF;
END $$;

-- ────────────────────────────────────────
--  FUNCTIONS & TRIGGERS
-- ────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update referral count when restaurant is created with referral code
CREATE OR REPLACE FUNCTION update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by_code IS NOT NULL THEN
    UPDATE creators
    SET referral_count = referral_count + 1,
        reward_status = CASE
          WHEN referral_count + 1 >= 5 THEN 'eligible'
          ELSE reward_status
        END
    WHERE ambassador_code = NEW.referred_by_code;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER restaurant_referral_trigger AFTER INSERT ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_referral_count();

-- ────────────────────────────────────────
--  VIEWS (helpful queries)
-- ────────────────────────────────────────

-- View for creators eligible for 100 euro reward
CREATE OR REPLACE VIEW eligible_creators AS
SELECT
  id,
  first_name,
  last_name,
  email,
  ambassador_code,
  referral_count,
  reward_status
FROM creators
WHERE referral_count >= 5 AND reward_status = 'eligible';

-- View for available restaurant slots
CREATE OR REPLACE VIEW available_restaurant_offers AS
SELECT
  r.id,
  r.name,
  r.cuisine_type,
  r.address,
  r.city,
  r.arrondissement,
  r.photos,
  r.offer_description,
  r.virality_bonus,
  r.is_published,
  json_agg(
    json_build_object(
      'id', ts.id,
      'day_of_week', ts.day_of_week,
      'start_time', ts.start_time,
      'end_time', ts.end_time,
      'max_bookings', ts.max_bookings
    )
  ) as time_slots
FROM restaurants r
LEFT JOIN time_slots ts ON r.id = ts.restaurant_id AND ts.is_active = true
GROUP BY r.id;
