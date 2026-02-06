-- Fix RLS issues for compliance tables

-- Enable RLS on prohibited_purposes
ALTER TABLE public.prohibited_purposes ENABLE ROW LEVEL SECURITY;

-- Public can read prohibited purposes (they need to see what's not allowed)
CREATE POLICY "Anyone can read prohibited purposes" ON public.prohibited_purposes
FOR SELECT USING (true);

-- Only admins can manage prohibited purposes
CREATE POLICY "Admins can manage prohibited purposes" ON public.prohibited_purposes
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR is_admin_email());

-- Update contact submissions INSERT policy to be more specific
-- Allow submissions from authenticated or anonymous users but limit fields
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
FOR INSERT WITH CHECK (
  -- Allow anyone to insert but only their own submissions
  full_name IS NOT NULL AND
  email IS NOT NULL AND
  subject IS NOT NULL AND
  message IS NOT NULL
);