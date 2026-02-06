-- Create travel insurance policies table
CREATE TABLE public.travel_insurance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  policy_number TEXT NOT NULL UNIQUE,
  
  -- Trip Details
  destination_country TEXT NOT NULL,
  travel_start_date DATE NOT NULL,
  travel_end_date DATE NOT NULL,
  trip_duration INTEGER NOT NULL,
  
  -- Plan Details
  plan_type TEXT NOT NULL CHECK (plan_type IN ('single', 'multi')),
  selected_plan TEXT NOT NULL CHECK (selected_plan IN ('basic', 'standard', 'premium')),
  add_ons JSONB DEFAULT '[]'::jsonb,
  premium_amount NUMERIC NOT NULL,
  
  -- Traveller Details (JSONB array of travellers)
  travellers JSONB NOT NULL DEFAULT '[]'::jsonb,
  number_of_travellers INTEGER NOT NULL DEFAULT 1,
  
  -- Payment Details
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  payment_transaction_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Policy Status
  policy_status TEXT NOT NULL DEFAULT 'draft' CHECK (policy_status IN ('draft', 'active', 'expired', 'cancelled', 'claimed')),
  issued_at TIMESTAMP WITH TIME ZONE,
  
  -- Coverage Details (stored for reference)
  coverage_details JSONB DEFAULT '{}'::jsonb,
  
  -- Claims
  has_claim BOOLEAN DEFAULT false,
  claim_status TEXT,
  claim_details JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.travel_insurance_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own policies"
  ON public.travel_insurance_policies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own policies"
  ON public.travel_insurance_policies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policies"
  ON public.travel_insurance_policies
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all policies"
  ON public.travel_insurance_policies
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

CREATE POLICY "Admins can update all policies"
  ON public.travel_insurance_policies
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

-- Create indexes
CREATE INDEX idx_travel_insurance_user_id ON public.travel_insurance_policies(user_id);
CREATE INDEX idx_travel_insurance_policy_number ON public.travel_insurance_policies(policy_number);
CREATE INDEX idx_travel_insurance_policy_status ON public.travel_insurance_policies(policy_status);
CREATE INDEX idx_travel_insurance_travel_dates ON public.travel_insurance_policies(travel_start_date, travel_end_date);

-- Function to generate policy number
CREATE OR REPLACE FUNCTION public.generate_insurance_policy_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.policy_number := 'TI' || TO_CHAR(NOW(), 'YYYYMMDD') || UPPER(SUBSTRING(NEW.id::text, 1, 6));
  RETURN NEW;
END;
$$;

-- Trigger for auto-generating policy number
CREATE TRIGGER generate_travel_insurance_policy_number
  BEFORE INSERT ON public.travel_insurance_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_insurance_policy_number();

-- Trigger for updating updated_at
CREATE TRIGGER update_travel_insurance_updated_at
  BEFORE UPDATE ON public.travel_insurance_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();