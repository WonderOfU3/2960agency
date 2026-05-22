-- Add username column to creators and creator_applications
ALTER TABLE creators ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS creators_username_idx ON creators(username);
