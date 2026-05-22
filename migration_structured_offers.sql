-- Structured offers: replace free-text offer_description with max_people + virality_tiers
-- max_people already exists from migration_calendar_booking.sql

-- Add virality_tiers JSONB column: array of {views: number, bonus: number}
-- Example: [{"views": 50000, "bonus": 100}, {"views": 100000, "bonus": 220}]
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS virality_tiers JSONB DEFAULT '[]'::jsonb;
