-- In-app notifications system
CREATE TABLE IF NOT EXISTS notifications (
  id            SERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  -- Target
  recipient_type TEXT NOT NULL,  -- 'creator' | 'restaurant' | 'admin'
  recipient_id   INTEGER NOT NULL,

  -- Content
  type          TEXT NOT NULL,    -- 'booking_new' | 'booking_accepted' | 'booking_refused' | 'booking_completed' | 'message' | 'review' | 'validation'
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  link          TEXT,             -- optional: relative URL to navigate to

  -- State
  read          BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS notif_recipient_idx ON notifications(recipient_type, recipient_id, read);
CREATE INDEX IF NOT EXISTS notif_created_idx ON notifications(created_at DESC);
