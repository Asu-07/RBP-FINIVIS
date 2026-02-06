-- Create recurring transfers table
CREATE TABLE public.recurring_transfers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
    source_currency TEXT NOT NULL DEFAULT 'INR',
    source_amount NUMERIC NOT NULL,
    destination_currency TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
    next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_run_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    transfer_method TEXT DEFAULT 'bank',
    purpose TEXT,
    notes TEXT,
    total_runs INTEGER DEFAULT 0,
    max_runs INTEGER, -- NULL means unlimited
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own recurring transfers"
ON public.recurring_transfers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring transfers"
ON public.recurring_transfers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transfers"
ON public.recurring_transfers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transfers"
ON public.recurring_transfers
FOR DELETE
USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all recurring transfers"
ON public.recurring_transfers
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR is_admin_email());

-- Update trigger
CREATE TRIGGER update_recurring_transfers_updated_at
BEFORE UPDATE ON public.recurring_transfers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add phone column to profiles for SMS notifications
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT false;