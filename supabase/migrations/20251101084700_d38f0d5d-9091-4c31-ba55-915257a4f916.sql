-- Add admin policies for teams table to allow editing
CREATE POLICY "Admins can update teams" 
ON public.teams 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert teams" 
ON public.teams 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete teams" 
ON public.teams 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::app_role));