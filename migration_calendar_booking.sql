-- Calendar booking system: store actual 1-hour sub-slots
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS slot_start_time TIME,
  ADD COLUMN IF NOT EXISTS slot_end_time TIME,
  ADD COLUMN IF NOT EXISTS num_people INTEGER DEFAULT 1;

-- Max people per collab (extracted from offer)
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS max_people INTEGER DEFAULT 2;
