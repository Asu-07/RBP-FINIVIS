
-- Create refundable_balances table (one per user)
CREATE TABLE public.refundable_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create refundable_balance_entries table (audit trail)
CREATE TABLE public.refundable_balance_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  refundable_balance_id UUID REFERENCES public.refundable_balances(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT,
  source_id UUID,
  source_reference TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create refund_requests table
CREATE TABLE public.refund_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  refundable_balance_id UUID REFERENCES public.refundable_balances(id),
  requested_amount NUMERIC NOT NULL,
  bank_account_name TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_ifsc TEXT NOT NULL,
  bank_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected')),
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_vouchers table (optional feature)
CREATE TABLE public.service_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  voucher_code TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  source_refundable_entry_id UUID REFERENCES public.refundable_balance_entries(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  used_for_service TEXT,
  used_for_order_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.refundable_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refundable_balance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_vouchers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for refundable_balances
CREATE POLICY "Users can view their own refundable balance"
  ON public.refundable_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all refundable balances"
  ON public.refundable_balances FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR is_admin_email());

CREATE POLICY "Admins can update all refundable balances"
  ON public.refundable_balances FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR is_admin_email());

CREATE POLICY "System can insert refundable balances"
  ON public.refundable_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR is_admin_email());

-- RLS Policies for refundable_balance_entries
CREATE POLICY "Users can view their own balance entries"
  ON public.refundable_balance_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all balance entries"
  ON public.refundable_balance_entries FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR is_admin_email());

CREATE POLICY "System can insert balance entries"
  ON public.refundable_balance_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR is_admin_email());

-- RLS Policies for refund_requests
CREATE POLICY "Users can view their own refund requests"
  ON public.refund_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own refund requests"
  ON public.refund_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all refund requests"
  ON public.refund_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR is_admin_email());

CREATE POLICY "Admins can update all refund requests"
  ON public.refund_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR is_admin_email());

-- RLS Policies for service_vouchers
CREATE POLICY "Users can view their own vouchers"
  ON public.service_vouchers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all vouchers"
  ON public.service_vouchers FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR is_admin_email());

CREATE POLICY "Admins can manage vouchers"
  ON public.service_vouchers FOR ALL
  USING (has_role(auth.uid(), 'admin') OR is_admin_email());

-- Function to credit refundable balance
CREATE OR REPLACE FUNCTION public.credit_refundable_balance(
  _user_id UUID,
  _amount NUMERIC,
  _reason TEXT,
  _source_type TEXT DEFAULT NULL,
  _source_id UUID DEFAULT NULL,
  _source_reference TEXT DEFAULT NULL,
  _description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _balance_id UUID;
  _entry_id UUID;
  _new_balance NUMERIC;
BEGIN
  -- Get or create refundable balance record
  INSERT INTO refundable_balances (user_id, balance_amount)
  VALUES (_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT id INTO _balance_id FROM refundable_balances WHERE user_id = _user_id;
  
  -- Update balance
  UPDATE refundable_balances
  SET balance_amount = balance_amount + _amount,
      updated_at = now()
  WHERE id = _balance_id
  RETURNING balance_amount INTO _new_balance;
  
  -- Create entry
  INSERT INTO refundable_balance_entries (
    user_id, refundable_balance_id, entry_type, amount, reason,
    source_type, source_id, source_reference, description
  ) VALUES (
    _user_id, _balance_id, 'credit', _amount, _reason,
    _source_type, _source_id, _source_reference, _description
  ) RETURNING id INTO _entry_id;
  
  RETURN json_build_object(
    'success', true,
    'entry_id', _entry_id,
    'new_balance', _new_balance
  );
END;
$$;

-- Function to debit refundable balance
CREATE OR REPLACE FUNCTION public.debit_refundable_balance(
  _user_id UUID,
  _amount NUMERIC,
  _reason TEXT,
  _source_type TEXT DEFAULT NULL,
  _source_id UUID DEFAULT NULL,
  _description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _balance_id UUID;
  _current_balance NUMERIC;
  _entry_id UUID;
  _new_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT id, balance_amount INTO _balance_id, _current_balance
  FROM refundable_balances WHERE user_id = _user_id;
  
  IF _balance_id IS NULL THEN
    RAISE EXCEPTION 'No refundable balance found for user';
  END IF;
  
  IF _current_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient refundable balance. Available: %, Requested: %', _current_balance, _amount;
  END IF;
  
  -- Update balance
  UPDATE refundable_balances
  SET balance_amount = balance_amount - _amount,
      updated_at = now()
  WHERE id = _balance_id
  RETURNING balance_amount INTO _new_balance;
  
  -- Create entry
  INSERT INTO refundable_balance_entries (
    user_id, refundable_balance_id, entry_type, amount, reason,
    source_type, source_id, description
  ) VALUES (
    _user_id, _balance_id, 'debit', _amount, _reason,
    _source_type, _source_id, _description
  ) RETURNING id INTO _entry_id;
  
  RETURN json_build_object(
    'success', true,
    'entry_id', _entry_id,
    'new_balance', _new_balance
  );
END;
$$;

-- Function for admin to process bank refund
CREATE OR REPLACE FUNCTION public.process_bank_refund(_refund_request_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _request RECORD;
  _debit_result JSON;
BEGIN
  -- Verify admin access
  IF NOT (has_role(auth.uid(), 'admin') OR is_admin_email()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get refund request
  SELECT * INTO _request FROM refund_requests WHERE id = _refund_request_id;
  
  IF _request IS NULL THEN
    RAISE EXCEPTION 'Refund request not found';
  END IF;
  
  IF _request.status != 'approved' THEN
    RAISE EXCEPTION 'Refund request must be approved first. Current status: %', _request.status;
  END IF;
  
  -- Debit the balance
  SELECT debit_refundable_balance(
    _request.user_id,
    _request.requested_amount,
    'bank_refund',
    'refund_request',
    _request.id,
    'Bank refund processed to account: ' || _request.bank_account_number
  ) INTO _debit_result;
  
  -- Update refund request status
  UPDATE refund_requests
  SET status = 'processed',
      processed_by = auth.uid(),
      processed_at = now(),
      updated_at = now()
  WHERE id = _refund_request_id;
  
  RETURN json_build_object(
    'success', true,
    'refund_request_id', _refund_request_id,
    'new_status', 'processed'
  );
END;
$$;

-- Trigger function to auto-credit balance on order rejection/cancellation
CREATE OR REPLACE FUNCTION public.auto_credit_on_order_rejection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when status changes to rejected or cancelled
  IF (NEW.status IN ('rejected', 'cancelled') AND OLD.status NOT IN ('rejected', 'cancelled')) THEN
    -- Only if rate lock payment was confirmed
    IF (NEW.rate_lock_payment_status = 'confirmed' OR NEW.advance_paid = true) THEN
      PERFORM credit_refundable_balance(
        NEW.user_id,
        NEW.advance_amount,
        CASE 
          WHEN NEW.status = 'rejected' THEN 'compliance_rejection'
          ELSE 'transaction_cancellation'
        END,
        'currency_exchange_order',
        NEW.id,
        NEW.order_number,
        'Refund for ' || NEW.status || ' order: ' || COALESCE(NEW.order_number, NEW.id::text)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on currency_exchange_orders
CREATE TRIGGER trigger_auto_credit_on_order_rejection
  AFTER UPDATE ON public.currency_exchange_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_credit_on_order_rejection();

-- Trigger function to auto-credit balance on transaction rejection
CREATE OR REPLACE FUNCTION public.auto_credit_on_transaction_rejection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when status changes to rejected or cancelled
  IF (NEW.status IN ('rejected', 'cancelled') AND OLD.status NOT IN ('rejected', 'cancelled')) THEN
    -- Only if there was an amount paid
    IF (NEW.source_amount > 0 AND OLD.status = 'pending') THEN
      PERFORM credit_refundable_balance(
        NEW.user_id,
        NEW.source_amount,
        CASE 
          WHEN NEW.status = 'rejected' THEN 'compliance_rejection'
          ELSE 'transaction_cancellation'
        END,
        'transaction',
        NEW.id,
        NEW.reference_number,
        'Refund for ' || NEW.status || ' transaction: ' || COALESCE(NEW.reference_number, NEW.id::text)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on transactions
CREATE TRIGGER trigger_auto_credit_on_transaction_rejection
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_credit_on_transaction_rejection();

-- Add updated_at trigger for new tables
CREATE TRIGGER update_refundable_balances_updated_at
  BEFORE UPDATE ON public.refundable_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refund_requests_updated_at
  BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
