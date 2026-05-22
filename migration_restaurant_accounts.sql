-- Restaurant user accounts (mirrors creators table pattern)
CREATE TABLE IF NOT EXISTS restaurant_users (
  id                SERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  owner_name        TEXT NOT NULL,
  phone             TEXT NOT NULL,
  business_name     TEXT NOT NULL,
  restaurant_id     INTEGER REFERENCES restaurants(id),
  status            TEXT DEFAULT 'pending_validation',
  application_id    INTEGER REFERENCES business_applications(id)
);

CREATE INDEX IF NOT EXISTS restaurant_users_email_idx ON restaurant_users(email);
CREATE INDEX IF NOT EXISTS restaurant_users_status_idx ON restaurant_users(status);

-- Add new columns to restaurants
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS auto_accept BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Updated_at trigger for restaurant_users
CREATE TRIGGER update_restaurant_users_updated_at BEFORE UPDATE ON restaurant_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
