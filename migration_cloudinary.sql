-- Add cloudinary_urls column to creator_applications for uploaded video/photo URLs
ALTER TABLE creator_applications
  ADD COLUMN IF NOT EXISTS cloudinary_urls TEXT[] DEFAULT '{}';
