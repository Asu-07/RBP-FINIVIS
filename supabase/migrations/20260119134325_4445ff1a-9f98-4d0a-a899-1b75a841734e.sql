-- =====================================================
-- COMPLIANCE & FLOW ALIGNMENT DATABASE MIGRATION
-- =====================================================

-- 1. Add new status values and compliance fields to currency_exchange_orders
ALTER TABLE public.currency_exchange_orders 
ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS compliance_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS compliance_reviewed_by UUID,
ADD COLUMN IF NOT EXISTS compliance_notes TEXT,
ADD COLUMN IF NOT EXISTS rate_validity_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS rate_confirmed_by_user BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_approved_by UUID,
ADD COLUMN IF NOT EXISTS refund_status TEXT,
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reference TEXT;

-- 2. Add compliance fields to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_approved_by UUID,
ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_status TEXT,
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0;

-- 3. Create contact_submissions table for contact form persistence
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on contact_submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for contact_submissions
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

-- 4. Create prohibited_purposes table for compliance
CREATE TABLE IF NOT EXISTS public.prohibited_purposes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purpose_code TEXT NOT NULL UNIQUE,
  purpose_name TEXT NOT NULL,
  description TEXT,
  regulation_reference TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default prohibited purposes per FEMA/RBI guidelines
INSERT INTO public.prohibited_purposes (purpose_code, purpose_name, description, regulation_reference) VALUES
  ('gambling', 'Gambling/Lottery', 'Remittances for gambling, lottery, or sweepstakes', 'FEMA Notification No. 19/2015-RB'),
  ('crypto_speculation', 'Crypto/Virtual Assets', 'Purchase of crypto currencies or virtual assets', 'RBI Circular dated May 2022'),
  ('margin_trading', 'Margin/Leverage Trading', 'Margin trading or leveraged forex trading', 'FEMA Notification No. 19/2015-RB'),
  ('capital_account_violation', 'Capital Account Violation', 'Transactions violating capital account regulations', 'FEMA 1999 Section 6'),
  ('gift_to_sanctioned', 'Gifts to Sanctioned Entities', 'Gifts to sanctioned countries/entities', 'UN/OFAC Sanctions'),
  ('money_laundering', 'Money Laundering', 'Suspected money laundering activities', 'PMLA 2002')
ON CONFLICT (purpose_code) DO NOTHING;

-- 5. Create comprehensive audit_logs table for all compliance events
CREATE TABLE IF NOT EXISTS public.compliance_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  admin_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on compliance_audit_logs
ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view compliance audit logs" ON public.compliance_audit_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

-- System can insert audit logs
CREATE POLICY "Authenticated users can insert own audit logs" ON public.compliance_audit_logs
FOR INSERT WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

-- 6. Add partner insurer fields to travel_insurance_policies
ALTER TABLE public.travel_insurance_policies
ADD COLUMN IF NOT EXISTS partner_insurer_name TEXT DEFAULT 'Partner Insurance Company',
ADD COLUMN IF NOT EXISTS partner_policy_reference TEXT,
ADD COLUMN IF NOT EXISTS insurer_issued_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS facilitator_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS disclaimer_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS disclaimer_accepted_at TIMESTAMPTZ;

-- 7. Add re-upload tracking to service_applications
ALTER TABLE public.service_applications
ADD COLUMN IF NOT EXISTS reupload_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reupload_reason TEXT,
ADD COLUMN IF NOT EXISTS documents_resubmitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- 8. Create function to log compliance events
CREATE OR REPLACE FUNCTION public.log_compliance_event(
  _user_id UUID,
  _action_type TEXT,
  _entity_type TEXT,
  _entity_id UUID,
  _details JSONB DEFAULT '{}'::JSONB,
  _admin_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
BEGIN
  INSERT INTO compliance_audit_logs (user_id, action_type, entity_type, entity_id, details, admin_user_id)
  VALUES (_user_id, _action_type, _entity_type, _entity_id, _details, _admin_user_id)
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- 9. Create function to check KYC status
CREATE OR REPLACE FUNCTION public.check_kyc_verified(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _kyc_status TEXT;
BEGIN
  SELECT kyc_status INTO _kyc_status
  FROM profiles
  WHERE user_id = _user_id;
  
  RETURN _kyc_status = 'verified';
END;
$$;

-- 10. Create function for admin to approve currency exchange order
CREATE OR REPLACE FUNCTION public.admin_approve_exchange_order(_order_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order RECORD;
  _user_kyc_status TEXT;
BEGIN
  -- Verify admin access
  IF NOT (has_role(auth.uid(), 'admin') OR is_admin_email()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get order details
  SELECT * INTO _order FROM currency_exchange_orders WHERE id = _order_id;
  
  IF _order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  IF _order.status NOT IN ('pending_compliance', 'documents_verified') THEN
    RAISE EXCEPTION 'Order must be pending compliance review. Current status: %', _order.status;
  END IF;
  
  -- Check user KYC
  SELECT kyc_status INTO _user_kyc_status FROM profiles WHERE user_id = _order.user_id;
  
  IF _user_kyc_status != 'verified' THEN
    RAISE EXCEPTION 'User KYC is not verified. Cannot approve order.';
  END IF;
  
  -- Approve and lock rate
  UPDATE currency_exchange_orders
  SET 
    status = 'approved',
    compliance_status = 'approved',
    compliance_reviewed_at = NOW(),
    compliance_reviewed_by = auth.uid(),
    rate_locked_at = NOW(),
    rate_expires_at = NOW() + INTERVAL '24 hours'
  WHERE id = _order_id;
  
  -- Log the event
  PERFORM log_compliance_event(
    _order.user_id,
    'order_approved',
    'currency_exchange_order',
    _order_id,
    jsonb_build_object('approved_by', auth.uid(), 'order_number', _order.order_number),
    auth.uid()
  );
  
  RETURN json_build_object(
    'success', true,
    'order_id', _order_id,
    'new_status', 'approved',
    'rate_locked_at', NOW()
  );
END;
$$;

-- 11. Create function for admin to reject exchange order
CREATE OR REPLACE FUNCTION public.admin_reject_exchange_order(_order_id UUID, _reason TEXT DEFAULT 'Compliance review failed')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order RECORD;
BEGIN
  -- Verify admin access
  IF NOT (has_role(auth.uid(), 'admin') OR is_admin_email()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get order details
  SELECT * INTO _order FROM currency_exchange_orders WHERE id = _order_id;
  
  IF _order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Reject order
  UPDATE currency_exchange_orders
  SET 
    status = 'rejected',
    compliance_status = 'rejected',
    compliance_reviewed_at = NOW(),
    compliance_reviewed_by = auth.uid(),
    compliance_notes = _reason
  WHERE id = _order_id;
  
  -- Log the event
  PERFORM log_compliance_event(
    _order.user_id,
    'order_rejected',
    'currency_exchange_order',
    _order_id,
    jsonb_build_object('rejected_by', auth.uid(), 'reason', _reason),
    auth.uid()
  );
  
  RETURN json_build_object(
    'success', true,
    'order_id', _order_id,
    'new_status', 'rejected'
  );
END;
$$;

-- 12. Create function for admin to approve remittance
CREATE OR REPLACE FUNCTION public.admin_approve_remittance(_transaction_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tx RECORD;
  _user_kyc_status TEXT;
BEGIN
  -- Verify admin access
  IF NOT (has_role(auth.uid(), 'admin') OR is_admin_email()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get transaction details
  SELECT * INTO _tx FROM transactions WHERE id = _transaction_id;
  
  IF _tx IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  IF _tx.compliance_status != 'pending_review' THEN
    RAISE EXCEPTION 'Transaction must be pending compliance review. Current status: %', _tx.compliance_status;
  END IF;
  
  -- Check user KYC
  SELECT kyc_status INTO _user_kyc_status FROM profiles WHERE user_id = _tx.user_id;
  
  IF _user_kyc_status != 'verified' THEN
    RAISE EXCEPTION 'User KYC is not verified. Cannot approve transaction.';
  END IF;
  
  -- Approve transaction
  UPDATE transactions
  SET 
    compliance_status = 'approved',
    admin_approved_at = NOW(),
    admin_approved_by = auth.uid(),
    status = 'approved'
  WHERE id = _transaction_id;
  
  -- Log the event
  PERFORM log_compliance_event(
    _tx.user_id,
    'remittance_approved',
    'transaction',
    _transaction_id,
    jsonb_build_object('approved_by', auth.uid(), 'reference', _tx.reference_number),
    auth.uid()
  );
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'new_status', 'approved'
  );
END;
$$;

-- 13. Create function to cancel transaction
CREATE OR REPLACE FUNCTION public.request_transaction_cancellation(_transaction_id UUID, _reason TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tx RECORD;
BEGIN
  -- Get transaction details
  SELECT * INTO _tx FROM transactions WHERE id = _transaction_id;
  
  IF _tx IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  -- Verify ownership
  IF _tx.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Only allow cancellation for certain statuses
  IF _tx.status NOT IN ('pending', 'pending_review', 'approved') THEN
    RAISE EXCEPTION 'Cannot cancel transaction in status: %', _tx.status;
  END IF;
  
  -- Request cancellation
  UPDATE transactions
  SET 
    cancellation_requested_at = NOW(),
    cancellation_reason = _reason,
    status = 'cancellation_pending'
  WHERE id = _transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'status', 'cancellation_pending'
  );
END;
$$;

-- 14. Create trigger for updated_at on new tables
CREATE TRIGGER update_contact_submissions_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_user_id ON public.compliance_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_entity ON public.compliance_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_created_at ON public.compliance_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_currency_exchange_orders_compliance ON public.currency_exchange_orders(compliance_status);
CREATE INDEX IF NOT EXISTS idx_transactions_compliance ON public.transactions(compliance_status);