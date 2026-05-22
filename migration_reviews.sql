-- Post-collab review system
CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  booking_id    INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_type TEXT NOT NULL,   -- 'creator' | 'restaurant'
  reviewer_id   INTEGER NOT NULL,

  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,

  UNIQUE(booking_id, reviewer_type) -- one review per side per booking
);

CREATE INDEX IF NOT EXISTS reviews_booking_idx ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS reviews_creator_idx ON reviews(reviewer_type, reviewer_id);
