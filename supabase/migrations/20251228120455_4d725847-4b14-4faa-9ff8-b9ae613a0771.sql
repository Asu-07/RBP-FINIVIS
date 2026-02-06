-- Create beneficiaries table
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_swift_code TEXT,
  bank_iban TEXT,
  bank_routing_number TEXT,
  bank_address TEXT,
  country TEXT NOT NULL,
  currency TEXT NOT NULL,
  beneficiary_type TEXT DEFAULT 'individual' CHECK (beneficiary_type IN ('individual', 'business')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on beneficiaries
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- Beneficiaries RLS policies
CREATE POLICY "Users can view their own beneficiaries"
ON public.beneficiaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own beneficiaries"
ON public.beneficiaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beneficiaries"
ON public.beneficiaries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own beneficiaries"
ON public.beneficiaries FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for beneficiaries updated_at
CREATE TRIGGER update_beneficiaries_updated_at
BEFORE UPDATE ON public.beneficiaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create wallets table
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  currency TEXT NOT NULL,
  balance DECIMAL(18, 4) NOT NULL DEFAULT 0,
  available_balance DECIMAL(18, 4) NOT NULL DEFAULT 0,
  held_balance DECIMAL(18, 4) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Enable RLS on wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Wallets RLS policies
CREATE POLICY "Users can view their own wallets"
ON public.wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallets"
ON public.wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets"
ON public.wallets FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for wallets updated_at
CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('remittance', 'pay_in', 'pay_out', 'fx_conversion', 'card_load')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'on_hold')),
  
  -- Source details
  source_currency TEXT NOT NULL,
  source_amount DECIMAL(18, 4) NOT NULL,
  source_wallet_id UUID REFERENCES public.wallets(id),
  
  -- Destination details
  destination_currency TEXT NOT NULL,
  destination_amount DECIMAL(18, 4) NOT NULL,
  destination_wallet_id UUID REFERENCES public.wallets(id),
  beneficiary_id UUID REFERENCES public.beneficiaries(id),
  
  -- FX details
  exchange_rate DECIMAL(18, 8),
  
  -- Fees
  fee_amount DECIMAL(18, 4) DEFAULT 0,
  fee_currency TEXT,
  
  -- Additional info
  reference_number TEXT UNIQUE,
  purpose TEXT,
  notes TEXT,
  
  -- Compliance
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'rejected', 'review')),
  compliance_notes TEXT,
  
  -- Timestamps
  initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions RLS policies
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for transactions updated_at
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate reference number
CREATE OR REPLACE FUNCTION public.generate_transaction_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reference_number := 'RBP' || TO_CHAR(NOW(), 'YYYYMMDD') || UPPER(SUBSTRING(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-generating reference number
CREATE TRIGGER set_transaction_reference
BEFORE INSERT ON public.transactions
FOR EACH ROW
WHEN (NEW.reference_number IS NULL)
EXECUTE FUNCTION public.generate_transaction_reference();

-- Create function to auto-create default wallets for new users
CREATE OR REPLACE FUNCTION public.create_default_wallets()
RETURNS TRIGGER AS $$
BEGIN
  -- Create INR wallet
  INSERT INTO public.wallets (user_id, currency) VALUES (NEW.id, 'INR');
  -- Create USD wallet
  INSERT INTO public.wallets (user_id, currency) VALUES (NEW.id, 'USD');
  -- Create EUR wallet
  INSERT INTO public.wallets (user_id, currency) VALUES (NEW.id, 'EUR');
  -- Create GBP wallet
  INSERT INTO public.wallets (user_id, currency) VALUES (NEW.id, 'GBP');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create wallets on user signup
CREATE TRIGGER on_auth_user_created_wallets
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_default_wallets();

-- Create index for faster queries
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX idx_beneficiaries_user_id ON public.beneficiaries(user_id);
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);