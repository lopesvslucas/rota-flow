-- Run this in Supabase SQL Editor
-- Migration: add logo_url, payment fields, tag, and receipt_url

ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;

ALTER TABLE routes ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS payment_confirmed_at DATE DEFAULT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT NULL;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_url TEXT DEFAULT NULL;

-- Create receipts storage bucket (run once)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT DO NOTHING;
