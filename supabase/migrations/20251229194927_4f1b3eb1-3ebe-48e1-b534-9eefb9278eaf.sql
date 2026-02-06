-- =====================================================
-- SECURITY FIX: Remove user UPDATE policy on wallets
-- and create secure database functions for financial operations
-- =====================================================

-- Step 1: Add balance constraints to prevent negative balances
ALTER TABLE public.wallets
  ADD CONSTRAINT check_balance_non_negative 
    CHECK (balance >= 0),
  ADD CONSTRAINT check_available_balance_non_negative 
    CHECK (available_balance >= 0),
  ADD CONSTRAINT check_held_balance_non_negative 
    CHECK (held_balance >= 0);

-- Step 2: Drop the insecure user update policy on wallets
DROP POLICY IF EXISTS "Users can update their own wallets" ON public.wallets;

-- Step 3: Create secure deposit function
CREATE OR REPLACE FUNCTION public.process_wallet_deposit(
  _wallet_id UUID,
  _amount NUMERIC,
  _payment_method TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _transaction_id UUID;
  _reference_number TEXT;
  _currency TEXT;
BEGIN
  -- Verify wallet belongs to current user
  SELECT user_id, currency INTO _user_id, _currency
  FROM wallets
  WHERE id = _wallet_id;
  
  IF _user_id IS NULL OR _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Wallet not found or access denied';
  END IF;
  
  -- Validate amount
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  
  IF _amount < 100 THEN
    RAISE EXCEPTION 'Minimum deposit amount is 100';
  END IF;
  
  -- Atomic update with validation
  UPDATE wallets
  SET 
    balance = balance + _amount,
    available_balance = available_balance + _amount,
    updated_at = now()
  WHERE id = _wallet_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    transaction_type,
    source_currency,
    source_amount,
    destination_currency,
    destination_amount,
    destination_wallet_id,
    status,
    completed_at,
    purpose
  ) VALUES (
    auth.uid(),
    'deposit',
    _currency,
    _amount,
    _currency,
    _amount,
    _wallet_id,
    'completed',
    now(),
    'Wallet top-up via ' || _payment_method
  )
  RETURNING id, reference_number INTO _transaction_id, _reference_number;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'reference_number', _reference_number
  );
END;
$$;

-- Step 4: Create secure transfer/send function
CREATE OR REPLACE FUNCTION public.process_wallet_transfer(
  _source_wallet_id UUID,
  _amount NUMERIC,
  _fee NUMERIC,
  _destination_currency TEXT,
  _destination_amount NUMERIC,
  _exchange_rate NUMERIC,
  _beneficiary_id UUID DEFAULT NULL,
  _purpose TEXT DEFAULT 'International remittance',
  _notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _source_balance NUMERIC;
  _source_currency TEXT;
  _transaction_id UUID;
  _reference_number TEXT;
  _total_deduction NUMERIC;
BEGIN
  _total_deduction := _amount + COALESCE(_fee, 0);
  
  -- Verify wallet and get balance
  SELECT user_id, available_balance, currency 
  INTO _user_id, _source_balance, _source_currency
  FROM wallets
  WHERE id = _source_wallet_id;
  
  IF _user_id IS NULL OR _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Wallet not found or access denied';
  END IF;
  
  -- Validate amount
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  
  -- Check sufficient balance
  IF _source_balance < _total_deduction THEN
    RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', _total_deduction, _source_balance;
  END IF;
  
  -- Deduct from source wallet
  UPDATE wallets
  SET 
    balance = balance - _total_deduction,
    available_balance = available_balance - _total_deduction,
    updated_at = now()
  WHERE id = _source_wallet_id;
  
  -- Create transaction
  INSERT INTO transactions (
    user_id,
    transaction_type,
    source_currency,
    source_amount,
    source_wallet_id,
    destination_currency,
    destination_amount,
    exchange_rate,
    fee_amount,
    fee_currency,
    beneficiary_id,
    status,
    purpose,
    notes
  ) VALUES (
    auth.uid(),
    'send',
    _source_currency,
    _total_deduction,
    _source_wallet_id,
    _destination_currency,
    _destination_amount,
    _exchange_rate,
    _fee,
    _source_currency,
    _beneficiary_id,
    'pending',
    _purpose,
    _notes
  )
  RETURNING id, reference_number INTO _transaction_id, _reference_number;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'reference_number', _reference_number
  );
END;
$$;

-- Step 5: Create secure currency exchange function
CREATE OR REPLACE FUNCTION public.process_currency_exchange(
  _from_wallet_id UUID,
  _to_wallet_id UUID,
  _from_amount NUMERIC,
  _to_amount NUMERIC,
  _exchange_rate NUMERIC,
  _spread_cost NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _from_balance NUMERIC;
  _from_currency TEXT;
  _to_currency TEXT;
  _to_user_id UUID;
  _transaction_id UUID;
  _reference_number TEXT;
BEGIN
  -- Verify from wallet belongs to current user
  SELECT user_id, available_balance, currency 
  INTO _user_id, _from_balance, _from_currency
  FROM wallets
  WHERE id = _from_wallet_id;
  
  IF _user_id IS NULL OR _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Source wallet not found or access denied';
  END IF;
  
  -- Verify to wallet belongs to current user
  SELECT user_id, currency INTO _to_user_id, _to_currency
  FROM wallets
  WHERE id = _to_wallet_id;
  
  IF _to_user_id IS NULL OR _to_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Destination wallet not found or access denied';
  END IF;
  
  -- Validate amounts
  IF _from_amount IS NULL OR _from_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid source amount';
  END IF;
  
  IF _to_amount IS NULL OR _to_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid destination amount';
  END IF;
  
  -- Check sufficient balance
  IF _from_balance < _from_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Deduct from source wallet
  UPDATE wallets
  SET 
    balance = balance - _from_amount,
    available_balance = available_balance - _from_amount,
    updated_at = now()
  WHERE id = _from_wallet_id;
  
  -- Add to destination wallet
  UPDATE wallets
  SET 
    balance = balance + _to_amount,
    available_balance = available_balance + _to_amount,
    updated_at = now()
  WHERE id = _to_wallet_id;
  
  -- Create transaction
  INSERT INTO transactions (
    user_id,
    transaction_type,
    source_currency,
    source_amount,
    destination_currency,
    destination_amount,
    exchange_rate,
    fee_amount,
    fee_currency,
    status,
    completed_at,
    notes
  ) VALUES (
    auth.uid(),
    'exchange',
    _from_currency,
    _from_amount,
    _to_currency,
    _to_amount,
    _exchange_rate,
    _spread_cost,
    _from_currency,
    'completed',
    now(),
    'Currency exchange from ' || _from_currency || ' to ' || _to_currency
  )
  RETURNING id, reference_number INTO _transaction_id, _reference_number;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'reference_number', _reference_number
  );
END;
$$;

-- Step 6: Create secure pay-in function
CREATE OR REPLACE FUNCTION public.process_payin(
  _wallet_id UUID,
  _amount NUMERIC,
  _currency TEXT,
  _reference_code TEXT,
  _bank_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _transaction_id UUID;
  _reference_number TEXT;
BEGIN
  -- Verify wallet belongs to current user
  SELECT user_id INTO _user_id
  FROM wallets
  WHERE id = _wallet_id;
  
  IF _user_id IS NULL OR _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Wallet not found or access denied';
  END IF;
  
  -- Validate amount
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  
  -- Create pending transaction (wallet update happens when payment is confirmed by admin)
  INSERT INTO transactions (
    user_id,
    transaction_type,
    source_currency,
    source_amount,
    destination_currency,
    destination_amount,
    destination_wallet_id,
    status,
    notes,
    purpose
  ) VALUES (
    auth.uid(),
    'payin',
    _currency,
    _amount,
    _currency,
    _amount,
    _wallet_id,
    'pending',
    'Pay-In via ' || _bank_name || '. Reference: ' || _reference_code,
    _reference_code
  )
  RETURNING id, reference_number INTO _transaction_id, _reference_number;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'reference_number', _reference_number
  );
END;
$$;

-- Step 7: Create secure pay-out function
CREATE OR REPLACE FUNCTION public.process_payout(
  _source_wallet_id UUID,
  _amount NUMERIC,
  _fee NUMERIC,
  _beneficiary_id UUID,
  _destination_currency TEXT,
  _destination_amount NUMERIC,
  _exchange_rate NUMERIC DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _source_balance NUMERIC;
  _source_currency TEXT;
  _beneficiary_user_id UUID;
  _beneficiary_name TEXT;
  _transaction_id UUID;
  _reference_number TEXT;
  _total_deduction NUMERIC;
BEGIN
  _total_deduction := _amount + COALESCE(_fee, 0);
  
  -- Verify wallet belongs to current user
  SELECT user_id, available_balance, currency 
  INTO _user_id, _source_balance, _source_currency
  FROM wallets
  WHERE id = _source_wallet_id;
  
  IF _user_id IS NULL OR _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Wallet not found or access denied';
  END IF;
  
  -- Verify beneficiary belongs to current user
  SELECT user_id, name INTO _beneficiary_user_id, _beneficiary_name
  FROM beneficiaries
  WHERE id = _beneficiary_id;
  
  IF _beneficiary_user_id IS NULL OR _beneficiary_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Beneficiary not found or access denied';
  END IF;
  
  -- Validate amount
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  
  -- Check sufficient balance
  IF _source_balance < _total_deduction THEN
    RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', _total_deduction, _source_balance;
  END IF;
  
  -- Deduct from wallet
  UPDATE wallets
  SET 
    balance = balance - _total_deduction,
    available_balance = available_balance - _total_deduction,
    updated_at = now()
  WHERE id = _source_wallet_id;
  
  -- Create transaction
  INSERT INTO transactions (
    user_id,
    transaction_type,
    source_currency,
    source_amount,
    destination_currency,
    destination_amount,
    exchange_rate,
    fee_amount,
    fee_currency,
    beneficiary_id,
    source_wallet_id,
    status,
    notes
  ) VALUES (
    auth.uid(),
    'payout',
    _source_currency,
    _amount,
    _destination_currency,
    _destination_amount,
    _exchange_rate,
    _fee,
    _source_currency,
    _beneficiary_id,
    _source_wallet_id,
    'processing',
    'Pay-Out to ' || _beneficiary_name
  )
  RETURNING id, reference_number INTO _transaction_id, _reference_number;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', _transaction_id,
    'reference_number', _reference_number
  );
END;
$$;

-- Step 8: Create admin function to confirm pay-in and credit wallet
CREATE OR REPLACE FUNCTION public.admin_confirm_payin(
  _transaction_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _wallet_id UUID;
  _amount NUMERIC;
  _tx_status TEXT;
BEGIN
  -- Verify admin access
  IF NOT (has_role(auth.uid(), 'admin') OR is_admin_email()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get transaction details
  SELECT destination_wallet_id, destination_amount, status 
  INTO _wallet_id, _amount, _tx_status
  FROM transactions
  WHERE id = _transaction_id AND transaction_type = 'payin';
  
  IF _wallet_id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  IF _tx_status = 'completed' THEN
    RAISE EXCEPTION 'Transaction already completed';
  END IF;
  
  -- Credit the wallet
  UPDATE wallets
  SET 
    balance = balance + _amount,
    available_balance = available_balance + _amount,
    updated_at = now()
  WHERE id = _wallet_id;
  
  -- Update transaction status
  UPDATE transactions
  SET 
    status = 'completed',
    completed_at = now()
  WHERE id = _transaction_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Step 9: Add validation constraints on beneficiaries table
ALTER TABLE public.beneficiaries
  ADD CONSTRAINT check_name_length CHECK (length(name) <= 200),
  ADD CONSTRAINT check_name_not_empty CHECK (trim(name) <> ''),
  ADD CONSTRAINT check_email_format CHECK (
    email IS NULL OR 
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  ADD CONSTRAINT check_swift_format CHECK (
    bank_swift_code IS NULL OR 
    (length(bank_swift_code) BETWEEN 8 AND 11 AND bank_swift_code ~ '^[A-Z0-9]+$')
  ),
  ADD CONSTRAINT check_iban_length CHECK (
    bank_iban IS NULL OR 
    (length(bank_iban) BETWEEN 15 AND 34)
  ),
  ADD CONSTRAINT check_account_length CHECK (
    bank_account_number IS NULL OR 
    length(bank_account_number) <= 34
  ),
  ADD CONSTRAINT check_bank_name_length CHECK (
    bank_name IS NULL OR 
    length(bank_name) <= 200
  ),
  ADD CONSTRAINT check_bank_address_length CHECK (
    bank_address IS NULL OR 
    length(bank_address) <= 500
  );