-- ============================================================
--  2960 AGENCY — Database Schema
--  Run this in your Neon SQL Editor (console.neon.tech)
-- ============================================================

-- ────────────────────────────────────────
--  CREATOR APPLICATIONS
-- ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS creator_applications (
  id          SERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  locale      TEXT DEFAULT 'fr',

  -- Section 1: About you
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT,
  tiktok_username       TEXT NOT NULL,
  instagram_username    TEXT,
  city                  TEXT NOT NULL,
  languages_spoken      TEXT[]  NOT NULL,
  content_languages     TEXT[]  NOT NULL,

  -- Section 2: Location
  favorite_arrondissements TEXT[]  NOT NULL DEFAULT '{}',
  other_areas           TEXT,
  travel_distance       TEXT NOT NULL,

  -- Section 3: Food preferences
  restaurant_types      TEXT[]  NOT NULL,
  other_cuisines        TEXT,
  likes_coffee_shops    TEXT NOT NULL,
  coffee_shop_preferences TEXT[] NOT NULL DEFAULT '{}',
  photogenic_matters    TEXT NOT NULL,
  top_priorities        TEXT[]  NOT NULL,

  -- Section 4: Ideal collabs
  ideal_place_type      TEXT NOT NULL,
  disliked_places       TEXT,
  dream_restaurant      TEXT,
  collab_preference     TEXT NOT NULL,
  preferred_platforms   TEXT[]  NOT NULL,
  has_done_collabs      TEXT NOT NULL,
  previous_collabs_detail TEXT,

  -- Section 4 NEW: Niche + Audience
  niche                 TEXT[]  NOT NULL DEFAULT '{}',
  audience_size         TEXT NOT NULL,

  -- Section 5: Content
  posted_content        TEXT NOT NULL,
  content_links         TEXT[]  NOT NULL DEFAULT '{}',
  content_note          TEXT,
  file_names            TEXT[]  NOT NULL DEFAULT '{}'
  -- NOTE: actual video files will be stored in Cloudinary (Phase 2)
  -- Add cloudinary_urls TEXT[] column when implementing
);

-- ────────────────────────────────────────
--  BUSINESS APPLICATIONS
-- ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS business_applications (
  id          SERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  locale      TEXT DEFAULT 'fr',

  -- Section 1: About your business
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

  -- Section 2: What you're looking for
  collab_offer          TEXT NOT NULL,
  content_wanted        TEXT[]  NOT NULL,
  content_destination   TEXT NOT NULL,   -- 'creator_account' | 'my_account' | 'both'
  creative_freedom      TEXT NOT NULL,
  collab_frequency      TEXT NOT NULL,   -- 'twice_week' | 'weekly' | 'bimonthly' | 'monthly' | 'as_needed'
  has_worked_with_creators TEXT NOT NULL,
  previous_creator_detail TEXT,
  visibility_challenge  TEXT,

  -- Section 3: Logistics
  offers_delivery       TEXT NOT NULL,
  open_to_delivery_collabs TEXT NOT NULL,
  best_days             TEXT[]  NOT NULL,
  best_times            TEXT[]  NOT NULL,
  heard_about           TEXT
);

-- ────────────────────────────────────────
--  INDEXES
-- ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS creator_email_idx     ON creator_applications  (email);
CREATE INDEX IF NOT EXISTS creator_created_idx   ON creator_applications  (created_at DESC);
CREATE INDEX IF NOT EXISTS creator_tiktok_idx    ON creator_applications  (tiktok_username);
CREATE INDEX IF NOT EXISTS creator_audience_idx  ON creator_applications  (audience_size);

CREATE INDEX IF NOT EXISTS business_email_idx    ON business_applications (email);
CREATE INDEX IF NOT EXISTS business_created_idx  ON business_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS business_city_idx     ON business_applications (city);
CREATE INDEX IF NOT EXISTS business_type_idx     ON business_applications (business_type);

-- ────────────────────────────────────────
--  COLLAB_FREQUENCY VALID VALUES (reference)
-- ────────────────────────────────────────
-- 'twice_week'  → 2–3 fois par semaine / 2–3 times a week   (NEW)
-- 'weekly'      → Une fois par semaine / Once a week
-- 'bimonthly'   → 2–3 fois par mois / 2–3 times a month
-- 'monthly'     → Une fois par mois / Once a month
-- 'as_needed'   → Selon les besoins / As needed
-- REMOVED: 'quarterly' (quelques fois par an)

-- ────────────────────────────────────────
--  CONTENT_DESTINATION VALID VALUES (reference)
-- ────────────────────────────────────────
-- 'creator_account' → Sur le compte du créateur / On the creator's account
-- 'my_account'      → Sur mon compte / On my account
-- 'both'            → Les deux / Both

-- ────────────────────────────────────────
--  AUDIENCE_SIZE VALID VALUES (reference)
-- ────────────────────────────────────────
-- '0_1k' | '1k_2k' | '2k_5k' | '5k_10k' | '10k_plus' | '20k_plus'
