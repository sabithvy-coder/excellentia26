DELETE FROM public.gallery
WHERE festival_id = (SELECT id FROM public.festivals WHERE year = 2025);

CREATE TABLE public.photo_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  festival_id uuid NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_message text NOT NULL DEFAULT 'Admin will send the photos folder drive to your email. Thank you for requesting.',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.photo_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.photo_requests TO authenticated;
GRANT ALL ON public.photo_requests TO service_role;

ALTER TABLE public.photo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can request festival photos"
ON public.photo_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view photo requests"
ON public.photo_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update photo requests"
ON public.photo_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.validate_photo_request()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.requester_name := btrim(NEW.requester_name);
  NEW.requester_email := lower(btrim(NEW.requester_email));

  IF char_length(NEW.requester_name) < 1 OR char_length(NEW.requester_name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 1 and 100 characters';
  END IF;

  IF char_length(NEW.requester_email) > 255
     OR NEW.requester_email !~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$' THEN
    RAISE EXCEPTION 'Please provide a valid email address';
  END IF;

  IF NEW.status NOT IN ('pending', 'completed', 'ignored') THEN
    RAISE EXCEPTION 'Invalid photo request status';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_photo_request_before_write
BEFORE INSERT OR UPDATE ON public.photo_requests
FOR EACH ROW EXECUTE FUNCTION public.validate_photo_request();

CREATE OR REPLACE FUNCTION public.update_photo_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_photo_requests_updated_at
BEFORE UPDATE ON public.photo_requests
FOR EACH ROW EXECUTE FUNCTION public.update_photo_requests_updated_at();