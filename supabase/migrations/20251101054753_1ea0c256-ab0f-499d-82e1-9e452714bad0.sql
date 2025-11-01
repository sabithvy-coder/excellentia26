-- Fix search path for set_result_number function
CREATE OR REPLACE FUNCTION public.set_result_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.result_number IS NULL THEN
    NEW.result_number := nextval('public.results_result_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;