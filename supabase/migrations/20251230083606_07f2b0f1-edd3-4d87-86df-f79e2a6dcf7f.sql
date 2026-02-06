-- Add new admin function for updating transaction status with dispatch step
CREATE OR REPLACE FUNCTION public.admin_dispatch_transaction(_transaction_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    RAISE EXCEPTION 'Transaction must be in processing status to dispatch. Current status: %', _tx_status;
  END IF;
  
  -- Update transaction status to dispatched
  UPDATE transactions
  SET 
    status = 'dispatched',
    compliance_notes = COALESCE(compliance_notes || E'\n', '') || 'Dispatched on ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')
  WHERE id = _transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'new_status', 'dispatched'
  );
END;
$function$;