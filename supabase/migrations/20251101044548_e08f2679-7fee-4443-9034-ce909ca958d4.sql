-- Create function to verify admin login
CREATE OR REPLACE FUNCTION verify_admin(p_username TEXT, p_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_hash TEXT;
BEGIN
  SELECT password_hash INTO v_hash
  FROM public.admin_users
  WHERE username = p_username;
  
  IF v_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN v_hash = crypt(p_password, v_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;