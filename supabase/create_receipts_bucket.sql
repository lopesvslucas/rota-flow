-- Run this in Supabase SQL Editor
-- Creates the receipts storage bucket + public access policy

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts');

-- Allow public read
CREATE POLICY "Allow public read receipts" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'receipts');

-- Allow authenticated users to delete their files
CREATE POLICY "Allow authenticated delete receipts" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'receipts');

-- Also add the receipt_url column if not done yet
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_url TEXT DEFAULT NULL;
