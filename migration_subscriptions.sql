-- Add subscription plan to restaurants
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS subscription TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS included_collabs INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extra_collab_price DECIMAL(10,2) DEFAULT 35.00;

-- Values for subscription: 'free' | 'basic' | 'active' | 'pro'
-- free:   0 included, 35€/collab
-- basic:  1 included, 20€/collab extra
-- active: 4 included, 12€/collab extra
-- pro:    unlimited (999), 0€/collab extra

-- Track completed collabs per month for billing
CREATE TABLE IF NOT EXISTS collab_usage (
  id              SERIAL PRIMARY KEY,
  restaurant_id   INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  month           TEXT NOT NULL,  -- format: '2026-05'
  completed_count INTEGER DEFAULT 0,
  UNIQUE(restaurant_id, month)
);

CREATE INDEX IF NOT EXISTS collab_usage_resto_idx ON collab_usage(restaurant_id);
CREATE INDEX IF NOT EXISTS collab_usage_month_idx ON collab_usage(month);
