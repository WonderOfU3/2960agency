ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS dietary_options TEXT[] DEFAULT '{}';
