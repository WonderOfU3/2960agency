-- Post deadline enforcement

-- Track violations on creators
ALTER TABLE creators ADD COLUMN IF NOT EXISTS post_violations INTEGER DEFAULT 0;

-- Deadline enforcement on bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS post_deadline_notified BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS post_overdue BOOLEAN DEFAULT false;

-- Reporting system
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reported_by_restaurant BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS report_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reported_at TIMESTAMPTZ;
