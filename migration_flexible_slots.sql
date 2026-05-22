-- Add specific_date to time_slots for one-off date slots
ALTER TABLE time_slots
  ADD COLUMN IF NOT EXISTS specific_date DATE DEFAULT NULL;

-- NULL = recurring weekly slot (every Monday, etc.)
-- Set = only available on that specific date
