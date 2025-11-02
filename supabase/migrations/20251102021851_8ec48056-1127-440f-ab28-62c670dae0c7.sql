-- Drop the existing restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Allow public to insert donations" ON public.donations;

-- Create a permissive policy for public inserts
CREATE POLICY "Enable insert for all users"
ON public.donations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);