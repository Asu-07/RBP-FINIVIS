-- Add input validation constraints to transactions table
ALTER TABLE public.transactions
  ADD CONSTRAINT check_notes_length CHECK (notes IS NULL OR length(notes) <= 1000),
  ADD CONSTRAINT check_purpose_length CHECK (purpose IS NULL OR length(purpose) <= 200),
  ADD CONSTRAINT check_reference_length CHECK (reference_number IS NULL OR length(reference_number) <= 50),
  ADD CONSTRAINT check_source_amount_positive CHECK (source_amount > 0),
  ADD CONSTRAINT check_destination_amount_positive CHECK (destination_amount > 0),
  ADD CONSTRAINT check_amount_reasonable CHECK (source_amount <= 100000000);

-- Add input validation constraints to profiles table
ALTER TABLE public.profiles
  ADD CONSTRAINT check_full_name_length CHECK (full_name IS NULL OR length(full_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT check_phone_length CHECK (phone IS NULL OR length(phone) BETWEEN 10 AND 15),
  ADD CONSTRAINT check_email_format CHECK (
    email IS NULL OR 
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- Add input validation constraints to currency_exchange_orders table
ALTER TABLE public.currency_exchange_orders
  ADD CONSTRAINT check_order_notes_length CHECK (notes IS NULL OR length(notes) <= 1000),
  ADD CONSTRAINT check_payee_name_length CHECK (payee_name IS NULL OR length(payee_name) <= 200),
  ADD CONSTRAINT check_payee_address_length CHECK (payee_address IS NULL OR length(payee_address) <= 500),
  ADD CONSTRAINT check_payee_phone_length CHECK (payee_phone IS NULL OR length(payee_phone) BETWEEN 10 AND 15),
  ADD CONSTRAINT check_delivery_address_length CHECK (delivery_address IS NULL OR length(delivery_address) <= 500),
  ADD CONSTRAINT check_order_amount_positive CHECK (amount > 0);

-- Add input validation constraints to recurring_transfers table
ALTER TABLE public.recurring_transfers
  ADD CONSTRAINT check_recurring_notes_length CHECK (notes IS NULL OR length(notes) <= 1000),
  ADD CONSTRAINT check_recurring_purpose_length CHECK (purpose IS NULL OR length(purpose) <= 200),
  ADD CONSTRAINT check_recurring_amount_positive CHECK (source_amount > 0);

-- Add input validation constraints to service_applications table
ALTER TABLE public.service_applications
  ADD CONSTRAINT check_admin_notes_length CHECK (admin_notes IS NULL OR length(admin_notes) <= 1000),
  ADD CONSTRAINT check_action_required_length CHECK (action_required IS NULL OR length(action_required) <= 500),
  ADD CONSTRAINT check_rejection_reason_length CHECK (rejection_reason IS NULL OR length(rejection_reason) <= 500);