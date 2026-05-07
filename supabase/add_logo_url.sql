-- Add payment confirmation fields to routes table
-- Run this in Supabase SQL Editor

ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;

ALTER TABLE routes ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS payment_confirmed_at DATE DEFAULT NULL;
