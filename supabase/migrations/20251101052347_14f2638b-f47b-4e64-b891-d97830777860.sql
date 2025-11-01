-- Drop the problematic view that exposes auth.users
DROP VIEW IF EXISTS public.user_roles_with_email;

-- The add_admin_role_by_email function is fine and doesn't have security issues
-- It allows you to add admin roles using email instead of UUID

-- For admins to see user emails, create a secure function instead
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role app_role,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to view this
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    ur.user_id,
    au.email,
    ur.role,
    ur.created_at
  FROM public.user_roles ur
  JOIN auth.users au ON ur.user_id = au.id;
END;
$$;