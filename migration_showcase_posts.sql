-- Add showcase_posts and niche to creators
ALTER TABLE creators ADD COLUMN IF NOT EXISTS showcase_posts TEXT[] DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS niche TEXT[] DEFAULT '{}';
