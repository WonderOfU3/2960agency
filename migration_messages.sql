-- Messages table for creator ↔ restaurant conversations
CREATE TABLE IF NOT EXISTS messages (
  id            SERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  booking_id    INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_type   TEXT NOT NULL, -- 'creator' | 'restaurant'
  sender_name   TEXT NOT NULL,
  content       TEXT NOT NULL,
  is_read       BOOLEAN DEFAULT false
);

-- Conversation tokens for restaurants (no-login access)
CREATE TABLE IF NOT EXISTS conversation_tokens (
  id            SERIAL PRIMARY KEY,
  token         TEXT NOT NULL UNIQUE,
  booking_id    INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_booking_idx ON messages(booking_id);
CREATE INDEX IF NOT EXISTS conv_token_idx ON conversation_tokens(token);
CREATE INDEX IF NOT EXISTS conv_booking_idx ON conversation_tokens(booking_id);
