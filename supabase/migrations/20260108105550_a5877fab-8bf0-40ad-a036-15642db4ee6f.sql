-- Create LRS Usage Tracker Table for RBI compliance
-- This tracks all forex usage per user per financial year against USD 250,000 limit

CREATE TABLE public.lrs_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  financial_year TEXT NOT NULL, -- e.g., '2024-25'
  service_type TEXT NOT NULL, -- 'remittance', 'currency_exchange', 'forex_card'
  transaction_id UUID, -- Reference to source transaction
  currency_exchange_order_id UUID, -- Reference to currency exchange order
  service_application_id UUID, -- Reference to forex card load
  amount_usd NUMERIC NOT NULL DEFAULT 0, -- Amount in USD equivalent
  purpose TEXT NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lrs_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own LRS usage"
  ON public.lrs_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LRS usage"
  ON public.lrs_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all LRS usage"
  ON public.lrs_usage
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

CREATE POLICY "Admins can update all LRS usage"
  ON public.lrs_usage
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

-- Create index for fast lookups
CREATE INDEX idx_lrs_usage_user_year ON public.lrs_usage(user_id, financial_year);

-- Function to get current financial year (April to March)
CREATE OR REPLACE FUNCTION public.get_current_financial_year()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year INTEGER;
  current_month INTEGER;
  fy_start INTEGER;
  fy_end INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  
  IF current_month >= 4 THEN
    fy_start := current_year;
    fy_end := current_year + 1;
  ELSE
    fy_start := current_year - 1;
    fy_end := current_year;
  END IF;
  
  RETURN fy_start || '-' || (fy_end % 100);
END;
$$;

-- Function to get LRS usage for a user
CREATE OR REPLACE FUNCTION public.get_lrs_usage(_user_id UUID, _financial_year TEXT DEFAULT NULL)
RETURNS TABLE(
  total_used NUMERIC,
  remaining_limit NUMERIC,
  usage_percentage NUMERIC,
  transaction_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fy TEXT;
  lrs_limit NUMERIC := 250000; -- USD 250,000 limit
  total NUMERIC;
BEGIN
  -- Use provided year or current
  IF _financial_year IS NULL THEN
    fy := get_current_financial_year();
  ELSE
    fy := _financial_year;
  END IF;
  
  -- Calculate total usage
  SELECT COALESCE(SUM(amount_usd), 0), COUNT(*)
  INTO total, transaction_count
  FROM lrs_usage
  WHERE user_id = _user_id AND financial_year = fy;
  
  total_used := total;
  remaining_limit := GREATEST(lrs_limit - total, 0);
  usage_percentage := (total / lrs_limit) * 100;
  
  RETURN NEXT;
END;
$$;

-- Add columns to remittance tracking in transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS lrs_purpose TEXT,
ADD COLUMN IF NOT EXISTS document_references TEXT[],
ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS declaration_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS usd_equivalent NUMERIC;

-- Add columns to service_applications for forex card with LRS tracking
ALTER TABLE public.service_applications
ADD COLUMN IF NOT EXISTS card_type TEXT,
ADD COLUMN IF NOT EXISTS load_amount NUMERIC,
ADD COLUMN IF NOT EXISTS load_currency TEXT,
ADD COLUMN IF NOT EXISTS usd_equivalent NUMERIC;

-- Create audit log table for admin actions
CREATE TABLE public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'kyc_approve', 'kyc_reject', 'transaction_approve', etc.
  target_type TEXT NOT NULL, -- 'profile', 'transaction', 'service_application', etc.
  target_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

-- Create AML flags table
CREATE TABLE public.aml_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id UUID,
  currency_exchange_order_id UUID,
  flag_type TEXT NOT NULL, -- 'high_value', 'repeated', 'unusual_country', 'limit_near'
  flag_reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'cleared', 'escalated'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on AML flags
ALTER TABLE public.aml_flags ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage AML flags
CREATE POLICY "Admins can view AML flags"
  ON public.aml_flags
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

CREATE POLICY "Admins can manage AML flags"
  ON public.aml_flags
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

-- Create index for AML flags
CREATE INDEX idx_aml_flags_status ON public.aml_flags(status);
CREATE INDEX idx_aml_flags_user ON public.aml_flags(user_id);

-- Function to auto-flag transactions
CREATE OR REPLACE FUNCTION public.check_aml_flags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usd_amount NUMERIC;
  tx_count INTEGER;
  lrs_data RECORD;
BEGIN
  -- Calculate USD equivalent (rough estimation)
  IF NEW.source_currency = 'INR' THEN
    usd_amount := NEW.source_amount / 85; -- Approximate rate
  ELSE
    usd_amount := NEW.source_amount;
  END IF;
  
  -- Flag high-value transactions (above $10,000)
  IF usd_amount > 10000 THEN
    INSERT INTO aml_flags (user_id, transaction_id, flag_type, flag_reason, severity)
    VALUES (NEW.user_id, NEW.id, 'high_value', 
            'Transaction amount exceeds $10,000 (USD ' || ROUND(usd_amount, 2) || ')', 'high');
  END IF;
  
  -- Check for repeated transactions (more than 5 in 24 hours)
  SELECT COUNT(*) INTO tx_count
  FROM transactions
  WHERE user_id = NEW.user_id 
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF tx_count > 5 THEN
    INSERT INTO aml_flags (user_id, transaction_id, flag_type, flag_reason, severity)
    VALUES (NEW.user_id, NEW.id, 'repeated', 
            tx_count || ' transactions in last 24 hours', 'medium');
  END IF;
  
  -- Check LRS limit approaching (above 80%)
  SELECT * INTO lrs_data FROM get_lrs_usage(NEW.user_id);
  IF lrs_data.usage_percentage > 80 THEN
    INSERT INTO aml_flags (user_id, transaction_id, flag_type, flag_reason, severity)
    VALUES (NEW.user_id, NEW.id, 'limit_near', 
            'LRS usage at ' || ROUND(lrs_data.usage_percentage, 1) || '% of annual limit', 'medium');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for AML checks on transactions
CREATE TRIGGER trigger_aml_check
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION check_aml_flags();