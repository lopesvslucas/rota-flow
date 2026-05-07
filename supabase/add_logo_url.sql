-- Add logo_url column to companies table
-- Run this in Supabase SQL Editor

ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;
