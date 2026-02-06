CREATE OR REPLACE FUNCTION public.admin_complete_transaction(_transaction_id uuid)
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

  -- Allow completion from processing OR dispatched
  IF _tx_status NOT IN ('processing', 'dispatched') THEN
    RAISE EXCEPTION 'Transaction must be in processing or dispatched status to complete. Current status: %', _tx_status;
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
$function$;