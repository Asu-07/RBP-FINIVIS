-- Add document and compliance fields to currency_exchange_orders
ALTER TABLE public.currency_exchange_orders
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS pan_number text,
ADD COLUMN IF NOT EXISTS destination_country text,
ADD COLUMN IF NOT EXISTS travel_start_date date,
ADD COLUMN IF NOT EXISTS travel_end_date date,
ADD COLUMN IF NOT EXISTS return_date_not_finalized boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS purpose text,
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lrs_declaration_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lrs_declaration_timestamp timestamp with time zone,
ADD COLUMN IF NOT EXISTS usd_equivalent numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS document_verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS document_verification_notes text,
ADD COLUMN IF NOT EXISTS document_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS document_verified_by uuid;

-- Create index for document verification status
CREATE INDEX IF NOT EXISTS idx_currency_exchange_orders_doc_status ON public.currency_exchange_orders(document_verification_status);

-- Create index for purpose
CREATE INDEX IF NOT EXISTS idx_currency_exchange_orders_purpose ON public.currency_exchange_orders(purpose);