-- Add billing_cycle column to restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT NULL;
