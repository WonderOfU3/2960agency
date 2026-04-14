-- Migration: Add collab_availability column to creator_applications table
-- Run this in your Neon SQL editor or using psql

ALTER TABLE creator_applications
ADD COLUMN IF NOT EXISTS collab_availability TEXT[] NOT NULL DEFAULT '{}';
