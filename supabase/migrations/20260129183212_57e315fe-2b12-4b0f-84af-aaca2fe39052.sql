-- Create kyc_documents table to link uploaded files with orders
CREATE TABLE public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.currency_exchange_orders(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  document_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Users can insert their own documents
CREATE POLICY "Users can insert their own documents"
ON public.kyc_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can select their own documents
CREATE POLICY "Users can select their own documents"
ON public.kyc_documents
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can select all documents
CREATE POLICY "Admins can select all documents"
ON public.kyc_documents
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR is_admin_email());

-- Admins can update all documents
CREATE POLICY "Admins can update all documents"
ON public.kyc_documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR is_admin_email());

-- Add index for faster lookups by user and order
CREATE INDEX idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_order_id ON public.kyc_documents(order_id);