-- Function to confirm bank transfer payments (admin only)
-- Updates transaction from 'pending' to 'processing' after payment verification
CREATE OR REPLACE FUNCTION public.admin_confirm_payment(_transaction_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _tx_status TEXT;
  _tx_type TEXT;
  _user_id UUID;
  _user_email TEXT;
BEGIN
  -- Verify admin access
  IF NOT (has_role(auth.uid(), 'admin') OR is_admin_email()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get transaction details
  SELECT status, transaction_type, user_id
  INTO _tx_status, _tx_type, _user_id
  FROM transactions
  WHERE id = _transaction_id;
  
  IF _tx_status IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  IF _tx_status != 'pending' THEN
    RAISE EXCEPTION 'Transaction is not pending. Current status: %', _tx_status;
  END IF;
  
  -- Update transaction status to processing
  UPDATE transactions
  SET 
    status = 'processing',
    compliance_status = 'approved',
    compliance_notes = 'Payment confirmed by admin on ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')
  WHERE id = _transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'new_status', 'processing'
  );
END;
$$;

-- Function to reject a payment (admin only)
CREATE OR REPLACE FUNCTION public.admin_reject_payment(_transaction_id uuid, _reason text DEFAULT 'Payment not received or invalid')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _tx_status TEXT;
BEGIN
  -- Verify admin access
  IF NOT (has_role(auth.uid(), 'admin') OR is_admin_email()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get transaction status
  SELECT status INTO _tx_status
  FROM transactions
  WHERE id = _transaction_id;
  
  IF _tx_status IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  IF _tx_status != 'pending' THEN
    RAISE EXCEPTION 'Transaction is not pending. Current status: %', _tx_status;
  END IF;
  
  -- Update transaction status to rejected
  UPDATE transactions
  SET 
    status = 'rejected',
    compliance_status = 'rejected',
    compliance_notes = _reason
  WHERE id = _transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'new_status', 'rejected'
  );
END;
$$;

-- Function to mark a transaction as complete (admin only)
CREATE OR REPLACE FUNCTION public.admin_complete_transaction(_transaction_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _tx_status TEXT;
BEGIN
  -- Verify admin access
  IF NOT (has_role(auth.uid(), 'admin') OR is_admin_email()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get transaction status
  SELECT status INTO _tx_status
  FROM transactions
  WHERE id = _transaction_id;
  
  IF _tx_status IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  IF _tx_status != 'processing' THEN
    RAISE EXCEPTION 'Transaction must be in processing status to complete. Current status: %', _tx_status;
  END IF;
  
  -- Update transaction status to completed
  UPDATE transactions
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = _transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'new_status', 'completed'
  );
END;
$$;