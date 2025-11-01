-- Add image_url to news table
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add result_number to results table
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS result_number INTEGER;

-- Create sequence for result_number auto-increment
CREATE SEQUENCE IF NOT EXISTS public.results_result_number_seq START 1;

-- Set existing results to have sequential result numbers
DO $$
DECLARE
  result_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR result_record IN 
    SELECT id FROM public.results ORDER BY created_at
  LOOP
    UPDATE public.results 
    SET result_number = counter 
    WHERE id = result_record.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Set default value for new results
ALTER TABLE public.results ALTER COLUMN result_number SET DEFAULT nextval('public.results_result_number_seq');

-- Create students table for individual points
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Allow public read access to students
CREATE POLICY "Allow public read access to students"
ON public.students
FOR SELECT
TO public
USING (true);

-- Admins can manage students
CREATE POLICY "Admins can manage students"
ON public.students
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Change another_grade fields to support multiple entries using JSONB
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS additional_grades JSONB DEFAULT '[]'::jsonb;

-- Update trigger function for result_number
CREATE OR REPLACE FUNCTION public.set_result_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.result_number IS NULL THEN
    NEW.result_number := nextval('public.results_result_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_result_number_trigger
BEFORE INSERT ON public.results
FOR EACH ROW
EXECUTE FUNCTION public.set_result_number();