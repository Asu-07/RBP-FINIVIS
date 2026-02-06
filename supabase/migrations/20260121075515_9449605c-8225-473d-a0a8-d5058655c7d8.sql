-- Add new columns for Buy/Sell Forex flow redesign
ALTER TABLE public.currency_exchange_orders
ADD COLUMN IF NOT EXISTS exchange_type text DEFAULT 'buy',
ADD COLUMN IF NOT EXISTS denomination_breakdown jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS settlement_method text,
ADD COLUMN IF NOT EXISTS settlement_bank_name text,
ADD COLUMN IF NOT EXISTS settlement_account_name text,
ADD COLUMN IF NOT EXISTS settlement_account_number text,
ADD COLUMN IF NOT EXISTS settlement_ifsc text,
ADD COLUMN IF NOT EXISTS rate_lock_payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS balance_settlement_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS balance_settlement_method text,
ADD COLUMN IF NOT EXISTS admin_rejection_reason text,
ADD COLUMN IF NOT EXISTS reupload_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_preference text DEFAULT 'home_delivery';

-- Add comments for documentation
COMMENT ON COLUMN public.currency_exchange_orders.exchange_type IS 'buy or sell forex';
COMMENT ON COLUMN public.currency_exchange_orders.denomination_breakdown IS 'JSON array of {denomination, quantity, subtotal} for sell forex';
COMMENT ON COLUMN public.currency_exchange_orders.settlement_method IS 'For sell forex: cash_pickup or bank_transfer';
COMMENT ON COLUMN public.currency_exchange_orders.rate_lock_payment_status IS 'pending, paid, confirmed';
COMMENT ON COLUMN public.currency_exchange_orders.balance_settlement_status IS 'pending, partial, completed';
COMMENT ON COLUMN public.currency_exchange_orders.delivery_preference IS 'home_delivery or branch_pickup';