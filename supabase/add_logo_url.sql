-- Run this in Supabase SQL Editor
-- Adds logo_url to companies, payment fields to routes, and tag to users

ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;

ALTER TABLE routes ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS payment_confirmed_at DATE DEFAULT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT NULL;
