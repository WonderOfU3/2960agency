-- Add Stripe Connect fields to creators
ALTER TABLE creators ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false;
