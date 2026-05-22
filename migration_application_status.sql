-- Add status column to business_applications
ALTER TABLE business_applications
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
-- Values: 'pending' | 'accepted' | 'rejected'

CREATE INDEX IF NOT EXISTS business_status_idx ON business_applications(status);
