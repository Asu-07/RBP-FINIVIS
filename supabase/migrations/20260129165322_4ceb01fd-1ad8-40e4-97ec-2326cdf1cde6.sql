-- Add length and format validation constraints to contact_submissions table
-- This prevents spam attacks with excessively long content

-- Drop existing policy first to recreate with validation
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- Create enhanced policy with length and format validation
CREATE POLICY "Anyone can submit contact form" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (
  full_name IS NOT NULL AND
  email IS NOT NULL AND
  subject IS NOT NULL AND
  message IS NOT NULL AND
  length(full_name) <= 200 AND
  length(email) <= 255 AND
  length(subject) <= 500 AND
  length(message) <= 5000 AND
  email ~ '^[^@]+@[^@]+\.[^@]+$'
);