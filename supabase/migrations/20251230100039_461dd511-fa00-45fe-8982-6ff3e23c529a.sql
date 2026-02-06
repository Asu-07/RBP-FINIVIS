-- Drop existing check constraint
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

-- Add updated check constraint with all needed statuses
ALTER TABLE public.transactions ADD CONSTRAINT transactions_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'dispatched'::text, 'completed'::text, 'rejected'::text, 'failed'::text, 'cancelled'::text, 'on_hold'::text]));