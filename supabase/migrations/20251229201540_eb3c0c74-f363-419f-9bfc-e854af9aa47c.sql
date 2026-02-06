-- Create user_service_intents table to track which services users have engaged with
CREATE TABLE public.user_service_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, service_type)
);

-- Enable RLS
ALTER TABLE public.user_service_intents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own service intents"
ON public.user_service_intents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service intents"
ON public.user_service_intents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service intents"
ON public.user_service_intents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all service intents"
ON public.user_service_intents FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

-- Create service_applications table for long-term service tracking (forex card, education loan, etc.)
CREATE TABLE public.service_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  application_status TEXT NOT NULL DEFAULT 'applied',
  application_data JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  admin_notes TEXT,
  action_required TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_applications
CREATE POLICY "Users can view their own applications"
ON public.service_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
ON public.service_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
ON public.service_applications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.service_applications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

CREATE POLICY "Admins can update all applications"
ON public.service_applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

-- Trigger for updated_at
CREATE TRIGGER update_user_service_intents_updated_at
BEFORE UPDATE ON public.user_service_intents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_applications_updated_at
BEFORE UPDATE ON public.service_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();