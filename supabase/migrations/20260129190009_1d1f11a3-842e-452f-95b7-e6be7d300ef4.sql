-- Add unique constraint on storage_path to prevent duplicate document records
ALTER TABLE public.kyc_documents ADD CONSTRAINT kyc_documents_storage_path_unique UNIQUE (storage_path);

-- Add index on storage_path for faster lookups
CREATE INDEX IF NOT EXISTS idx_kyc_documents_storage_path ON public.kyc_documents(storage_path);