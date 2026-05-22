-- Trial system for restaurants
-- 30 days + 3 free collabs upon admin approval

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_collabs_used INTEGER DEFAULT 0;

-- trial_started_at: set when admin accepts the restaurant
-- trial_ends_at: trial_started_at + 30 days
-- trial_collabs_used: incremented each time a free trial collab is confirmed
-- A restaurant is "on trial" when trial_started_at IS NOT NULL AND NOW() < trial_ends_at AND trial_collabs_used < 3
