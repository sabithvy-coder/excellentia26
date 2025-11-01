-- Add RLS policy for admin_users to prevent public access
CREATE POLICY "Block all access to admin_users" ON public.admin_users 
FOR ALL USING (false);