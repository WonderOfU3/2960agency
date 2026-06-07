-- ============================================================
--  2960 AGENCY — ANALYTICS EVENTS TABLE
--  Run in Neon SQL console
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event VARCHAR(64) NOT NULL,
  user_id VARCHAR(64),
  user_type VARCHAR(16) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events (event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events (user_type, user_id);
