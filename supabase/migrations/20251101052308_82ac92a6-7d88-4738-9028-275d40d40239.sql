-- Create a helper function to add admin role by email
CREATE OR REPLACE FUNCTION public.add_admin_role_by_email(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id from auth.users by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create a view to see users with their emails and current roles
CREATE OR REPLACE VIEW public.user_roles_with_email AS
SELECT 
  ur.id,
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id;

-- Grant access to the view for authenticated users with admin role
GRANT SELECT ON public.user_roles_with_email TO authenticated;