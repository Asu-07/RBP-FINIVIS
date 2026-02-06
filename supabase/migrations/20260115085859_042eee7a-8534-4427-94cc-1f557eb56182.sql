-- Fix RLS policy for travel_insurance_policies - the INSERT policy needs a WITH CHECK clause
DROP POLICY IF EXISTS "Users can create their own policies" ON public.travel_insurance_policies;

CREATE POLICY "Users can create their own policies" 
ON public.travel_insurance_policies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also add DELETE policy for users
CREATE POLICY "Users can delete their own policies" 
ON public.travel_insurance_policies 
FOR DELETE 
USING (auth.uid() = user_id);