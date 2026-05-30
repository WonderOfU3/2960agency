-- ============================================================
--  2960 AGENCY — FULL DB RESET (keeps admins + creator_applications)
--  Run this in Neon SQL console to drop and recreate everything
-- ============================================================

-- ════════════════════════════════════════
--  STEP 1: DROP everything except admins & creator_applications
-- ════════════════════════════════════════

DROP TABLE IF EXISTS conversation_tokens CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS collab_usage CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS verification_codes CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS restaurant_users CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS creators CASCADE;
DROP TABLE IF EXISTS business_applications CASCADE;

-- Drop views that reference dropped tables
DROP VIEW IF EXISTS eligible_creators CASCADE;
DROP VIEW IF EXISTS available_restaurant_offers CASCADE;

-- ════════════════════════════════════════
--  STEP 2: RECREATE business_applications
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_applications (
  id          SERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  locale      TEXT DEFAULT 'fr',

  business_name         TEXT NOT NULL,
  owner_name            TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  instagram_username    TEXT,
  tiktok_username       TEXT,
  website               TEXT,
  business_type         TEXT NOT NULL,
  cuisine_type          TEXT NOT NULL,
  address               TEXT NOT NULL,
  city                  TEXT NOT NULL,
  arrondissement        TEXT,

  collab_offer          TEXT NOT NULL,
  content_wanted        TEXT[]  NOT NULL,
  content_destination   TEXT DEFAULT '',
  creative_freedom      TEXT DEFAULT '',
  collab_frequency      TEXT NOT NULL,
  has_worked_with_creators TEXT NOT NULL,
  previous_creator_detail TEXT,
  visibility_challenge  TEXT,

  offers_delivery       TEXT DEFAULT '',
  open_to_delivery_collabs TEXT DEFAULT '',
  best_days             TEXT[]  NOT NULL,
  best_times            TEXT[]  NOT NULL,
  heard_about           TEXT,
  siren                 TEXT,
  avg_meal_price        INTEGER,
  manual_selection      BOOLEAN DEFAULT false,

  -- Added by migrations
  referred_by_ambassador_code TEXT,
  annual_subscription_price DECIMAL(10,2),
  status                TEXT DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS business_email_idx    ON business_applications (email);
CREATE INDEX IF NOT EXISTS business_created_idx  ON business_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS business_city_idx     ON business_applications (city);
CREATE INDEX IF NOT EXISTS business_type_idx     ON business_applications (business_type);
CREATE INDEX IF NOT EXISTS business_status_idx   ON business_applications(status);
CREATE INDEX IF NOT EXISTS business_referred_by_idx ON business_applications(referred_by_ambassador_code);

-- ════════════════════════════════════════
--  STEP 3: RECREATE creators
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS creators (
  id                SERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  username          TEXT UNIQUE,
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  phone             TEXT NOT NULL,

  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  tiktok_username   TEXT,
  instagram_username TEXT,
  city              TEXT,

  ambassador_code   TEXT NOT NULL UNIQUE,
  referral_count    INTEGER DEFAULT 0,
  reward_status     TEXT DEFAULT 'pending',

  status            TEXT DEFAULT 'pending_validation',

  -- Profile
  niche             TEXT[] DEFAULT '{}',
  showcase_posts    TEXT[] DEFAULT '{}',

  -- Stripe Connect
  stripe_connect_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  post_violations   INTEGER DEFAULT 0,

  application_id    INTEGER REFERENCES creator_applications(id)
);

CREATE INDEX IF NOT EXISTS creators_email_idx ON creators(email);
CREATE INDEX IF NOT EXISTS creators_ambassador_code_idx ON creators(ambassador_code);
CREATE INDEX IF NOT EXISTS creators_status_idx ON creators(status);
CREATE UNIQUE INDEX IF NOT EXISTS creators_username_idx ON creators(username);

-- ════════════════════════════════════════
--  STEP 4: RECREATE restaurants
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS restaurants (
  id                SERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  name              TEXT NOT NULL,
  cuisine_type      TEXT NOT NULL,
  address           TEXT NOT NULL,
  city              TEXT NOT NULL,
  arrondissement    TEXT,

  photos            TEXT[] DEFAULT '{}',

  offer_description TEXT NOT NULL,
  virality_bonus    DECIMAL(10,2),

  max_bookings_per_week   INTEGER DEFAULT 3,
  max_bookings_per_day    INTEGER DEFAULT 1,

  is_published      BOOLEAN DEFAULT false,

  business_application_id INTEGER REFERENCES business_applications(id),
  referred_by_code  TEXT REFERENCES creators(ambassador_code),

  -- From migrations
  auto_accept       BOOLEAN DEFAULT true,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  max_people        INTEGER DEFAULT 2,
  virality_tiers    JSONB DEFAULT '[]'::jsonb,
  directives        TEXT,
  is_blocked        BOOLEAN DEFAULT false,
  subscription      TEXT DEFAULT 'free',
  billing_cycle     TEXT DEFAULT NULL,  -- 'monthly' or 'yearly'
  included_collabs  INTEGER DEFAULT 0,
  extra_collab_price DECIMAL(10,2) DEFAULT 35.00,

  -- Trial system
  trial_started_at  TIMESTAMPTZ DEFAULT NULL,
  trial_ends_at     TIMESTAMPTZ DEFAULT NULL,
  trial_collabs_used INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS restaurants_published_idx ON restaurants(is_published);
CREATE INDEX IF NOT EXISTS restaurants_referred_by_idx ON restaurants(referred_by_code);

-- ════════════════════════════════════════
--  STEP 5: RECREATE time_slots
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS time_slots (
  id                SERIAL PRIMARY KEY,
  restaurant_id     INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  day_of_week       INTEGER NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  max_bookings      INTEGER DEFAULT 1,
  is_active         BOOLEAN DEFAULT true,
  specific_date     DATE DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS time_slots_restaurant_idx ON time_slots(restaurant_id);
CREATE INDEX IF NOT EXISTS time_slots_day_idx ON time_slots(day_of_week);

-- ════════════════════════════════════════
--  STEP 6: RECREATE bookings
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS bookings (
  id                SERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),

  creator_id        INTEGER NOT NULL REFERENCES creators(id),
  restaurant_id     INTEGER NOT NULL REFERENCES restaurants(id),
  time_slot_id      INTEGER NOT NULL REFERENCES time_slots(id),

  booking_date      DATE NOT NULL,
  status            TEXT DEFAULT 'confirmed',
  notes             TEXT,

  -- From migrations
  slot_start_time   TIME,
  slot_end_time     TIME,
  num_people        INTEGER DEFAULT 1,
  reconfirmed_at    TIMESTAMPTZ DEFAULT NULL,
  reminder_sent_at  TIMESTAMPTZ DEFAULT NULL,

  -- Post submission & virality claims
  post_link         TEXT,
  post_submitted_at TIMESTAMPTZ,
  claimed_tier      JSONB,
  claim_status      TEXT DEFAULT NULL,
  post_deadline_notified BOOLEAN DEFAULT false,
  post_overdue      BOOLEAN DEFAULT false,
  reported_by_restaurant BOOLEAN DEFAULT false,
  report_reason     TEXT,
  reported_at       TIMESTAMPTZ,

  -- No table-level UNIQUE: partial unique index below allows rebooking after cancel/refuse
);

CREATE INDEX IF NOT EXISTS bookings_creator_idx ON bookings(creator_id);
CREATE INDEX IF NOT EXISTS bookings_restaurant_idx ON bookings(restaurant_id);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(booking_date);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_active_per_day ON bookings(creator_id, restaurant_id, booking_date) WHERE status NOT IN ('cancelled', 'refused');

-- ════════════════════════════════════════
--  STEP 7: RECREATE restaurant_users
-- ════════════════════════════════════════

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

-- ════════════════════════════════════════
--  STEP 8: RECREATE messages & conversation_tokens
-- ════════════════════════════════════════

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

-- ════════════════════════════════════════
--  STEP 9: RECREATE collab_usage
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS collab_usage (
  id              SERIAL PRIMARY KEY,
  restaurant_id   INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  month           TEXT NOT NULL,
  completed_count INTEGER DEFAULT 0,
  UNIQUE(restaurant_id, month)
);

CREATE INDEX IF NOT EXISTS collab_usage_resto_idx ON collab_usage(restaurant_id);
CREATE INDEX IF NOT EXISTS collab_usage_month_idx ON collab_usage(month);

-- ════════════════════════════════════════
--  STEP 10: RECREATE reviews
-- ════════════════════════════════════════

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

-- ════════════════════════════════════════
--  STEP 10b: RECREATE invitations
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  creator_id INTEGER NOT NULL REFERENCES creators(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_restaurant ON invitations(restaurant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_invitations_creator ON invitations(creator_id, created_at);

-- ════════════════════════════════════════
--  STEP 11: RECREATE notifications
-- ════════════════════════════════════════

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

-- ════════════════════════════════════════
--  STEP 12: RECREATE verification_codes
-- ════════════════════════════════════════

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

-- ════════════════════════════════════════
--  STEP 13: RECREATE triggers & functions
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_creators_updated_at ON creators;
CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_restaurant_users_updated_at ON restaurant_users;
CREATE TRIGGER update_restaurant_users_updated_at BEFORE UPDATE ON restaurant_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ════════════════════════════════════════
--  STEP 14: RECREATE views
-- ════════════════════════════════════════

CREATE OR REPLACE VIEW eligible_creators AS
SELECT id, first_name, last_name, email, ambassador_code, referral_count, reward_status
FROM creators
WHERE referral_count >= 5 AND reward_status = 'eligible';

CREATE OR REPLACE VIEW available_restaurant_offers AS
SELECT
  r.id, r.name, r.cuisine_type, r.address, r.city, r.arrondissement,
  r.photos, r.offer_description, r.virality_bonus, r.is_published,
  json_agg(
    json_build_object(
      'id', ts.id, 'day_of_week', ts.day_of_week,
      'start_time', ts.start_time, 'end_time', ts.end_time,
      'max_bookings', ts.max_bookings
    )
  ) as time_slots
FROM restaurants r
LEFT JOIN time_slots ts ON r.id = ts.restaurant_id AND ts.is_active = true
GROUP BY r.id;

-- ════════════════════════════════════════
--  STEP 15: Add cloudinary_urls to creator_applications (if missing)
-- ════════════════════════════════════════

ALTER TABLE creator_applications
  ADD COLUMN IF NOT EXISTS cloudinary_urls TEXT[] DEFAULT '{}';

-- ============================================================
--  DONE — Database reset complete
--  Kept: admins, creator_applications
--  Recreated: everything else
-- ============================================================
