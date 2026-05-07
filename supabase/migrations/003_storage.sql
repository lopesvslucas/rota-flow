-- ============================================
-- RotaFlow — Storage Setup
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'route-attachments', 'route-attachments', true, 10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
);

CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'route-attachments');
CREATE POLICY "Auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'route-attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update" ON storage.objects FOR UPDATE USING (bucket_id = 'route-attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete" ON storage.objects FOR DELETE USING (bucket_id = 'route-attachments' AND auth.uid() IS NOT NULL);
