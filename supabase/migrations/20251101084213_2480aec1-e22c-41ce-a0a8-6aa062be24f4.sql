-- Add explicit DELETE policies for results and programs for admins
DROP POLICY IF EXISTS "Admins can delete results" ON public.results;
CREATE POLICY "Admins can delete results" 
ON public.results 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete programs" ON public.programs;
CREATE POLICY "Admins can delete programs" 
ON public.programs 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create function to update result numbers after deletion
CREATE OR REPLACE FUNCTION public.update_result_numbers_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Decrement result_number for all results with higher numbers
  UPDATE public.results
  SET result_number = result_number - 1
  WHERE result_number > OLD.result_number;
  
  RETURN OLD;
END;
$$;

-- Create trigger to auto-update result numbers on delete
DROP TRIGGER IF EXISTS update_result_numbers_after_delete ON public.results;
CREATE TRIGGER update_result_numbers_after_delete
AFTER DELETE ON public.results
FOR EACH ROW
EXECUTE FUNCTION public.update_result_numbers_on_delete();