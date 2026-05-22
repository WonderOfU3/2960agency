-- Add post submission and claim fields to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS post_link TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS post_submitted_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS claimed_tier JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT NULL;
