-- Drop existing triggers that automatically update team points
DROP TRIGGER IF EXISTS update_team_points_trigger ON public.results;
DROP TRIGGER IF EXISTS sync_student_points_trigger ON public.students;

-- Add published_points column to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS published_points integer DEFAULT 0;

-- Add published_points column to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS published_points integer DEFAULT 0;

-- Initialize published_points to match current points
UPDATE public.teams SET published_points = points;
UPDATE public.students SET published_points = points;

-- Create a setting for tracking which result number is published
INSERT INTO public.settings (key, value)
VALUES ('published_up_to_result', '0'::jsonb)
ON CONFLICT (key) DO NOTHING;