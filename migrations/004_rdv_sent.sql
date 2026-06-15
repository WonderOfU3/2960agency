-- Add rdv_sent_at column for C-RDV (day-before reminder) tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rdv_sent_at TIMESTAMPTZ;
