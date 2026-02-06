-- Create storage bucket for service application documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-documents', 'service-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for service-documents bucket
CREATE POLICY "Users can upload their own service documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own service documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'service-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own service documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'service-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own service documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all service documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'service-documents' 
  AND (has_role(auth.uid(), 'admin') OR is_admin_email())
);