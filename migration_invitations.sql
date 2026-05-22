-- Invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  creator_id INTEGER NOT NULL REFERENCES creators(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_restaurant ON invitations(restaurant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_invitations_creator ON invitations(creator_id, created_at);

-- Directives column on restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS directives TEXT;
