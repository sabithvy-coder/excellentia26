-- Add visibility control for team standings
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to settings"
ON public.settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default visibility setting
INSERT INTO public.settings (key, value)
VALUES ('team_standings_visible', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add grade_points_map to settings for admin configuration
INSERT INTO public.settings (key, value)
VALUES ('grade_points_map', '{"A+": 10, "A": 9, "A-": 8, "B+": 7, "B": 6, "B-": 5, "C+": 4, "C": 3, "C-": 2, "D": 1}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add grade columns to results table
ALTER TABLE public.results 
ADD COLUMN IF NOT EXISTS first_place_grade text,
ADD COLUMN IF NOT EXISTS second_place_grade text,
ADD COLUMN IF NOT EXISTS third_place_grade text;

-- Add grade column to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS grade text;

-- Update the trigger to handle grades
CREATE OR REPLACE FUNCTION public.update_team_points()
RETURNS TRIGGER AS $$
DECLARE
  grade_item JSONB;
BEGIN
  -- Update first place team and student points
  IF NEW.first_place_team IS NOT NULL THEN
    UPDATE public.teams 
    SET points = points + NEW.first_place_points 
    WHERE id = NEW.first_place_team;
    
    UPDATE public.students 
    SET points = points + NEW.first_place_points 
    WHERE name = NEW.first_place_name AND team_id = NEW.first_place_team;
  END IF;
  
  -- Update second place team and student points
  IF NEW.second_place_team IS NOT NULL THEN
    UPDATE public.teams 
    SET points = points + NEW.second_place_points 
    WHERE id = NEW.second_place_team;
    
    UPDATE public.students 
    SET points = points + NEW.second_place_points 
    WHERE name = NEW.second_place_name AND team_id = NEW.second_place_team;
  END IF;
  
  -- Update third place team and student points
  IF NEW.third_place_team IS NOT NULL THEN
    UPDATE public.teams 
    SET points = points + NEW.third_place_points 
    WHERE id = NEW.third_place_team;
    
    UPDATE public.students 
    SET points = points + NEW.third_place_points 
    WHERE name = NEW.third_place_name AND team_id = NEW.third_place_team;
  END IF;
  
  -- Update additional grades team and student points
  IF NEW.additional_grades IS NOT NULL THEN
    FOR grade_item IN SELECT * FROM jsonb_array_elements(NEW.additional_grades)
    LOOP
      IF (grade_item->>'team') IS NOT NULL THEN
        UPDATE public.teams 
        SET points = points + (grade_item->>'points')::integer 
        WHERE id = (grade_item->>'team')::uuid;
        
        UPDATE public.students 
        SET points = points + (grade_item->>'points')::integer 
        WHERE name = grade_item->>'name' AND team_id = (grade_item->>'team')::uuid;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_team_points_trigger ON public.results;
CREATE TRIGGER update_team_points_trigger
AFTER INSERT ON public.results
FOR EACH ROW
EXECUTE FUNCTION public.update_team_points();