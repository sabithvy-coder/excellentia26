-- Create trigger function to sync student points to team points
CREATE OR REPLACE FUNCTION public.sync_student_points_to_team()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- When a new student is added, add their points to the team
    IF NEW.team_id IS NOT NULL THEN
      UPDATE public.teams
      SET points = points + COALESCE(NEW.points, 0)
      WHERE id = NEW.team_id;
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- When student points are updated, adjust team points by the difference
    IF OLD.team_id IS NOT NULL AND NEW.team_id IS NOT NULL THEN
      IF OLD.team_id = NEW.team_id THEN
        -- Same team, just update the difference
        UPDATE public.teams
        SET points = GREATEST(0, points - COALESCE(OLD.points, 0) + COALESCE(NEW.points, 0))
        WHERE id = NEW.team_id;
      ELSE
        -- Team changed, subtract from old team and add to new team
        UPDATE public.teams
        SET points = GREATEST(0, points - COALESCE(OLD.points, 0))
        WHERE id = OLD.team_id;
        
        UPDATE public.teams
        SET points = points + COALESCE(NEW.points, 0)
        WHERE id = NEW.team_id;
      END IF;
    ELSIF OLD.team_id IS NULL AND NEW.team_id IS NOT NULL THEN
      -- Student assigned to a team
      UPDATE public.teams
      SET points = points + COALESCE(NEW.points, 0)
      WHERE id = NEW.team_id;
    ELSIF OLD.team_id IS NOT NULL AND NEW.team_id IS NULL THEN
      -- Student removed from team
      UPDATE public.teams
      SET points = GREATEST(0, points - COALESCE(OLD.points, 0))
      WHERE id = OLD.team_id;
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- When a student is deleted, subtract their points from the team
    IF OLD.team_id IS NOT NULL THEN
      UPDATE public.teams
      SET points = GREATEST(0, points - COALESCE(OLD.points, 0))
      WHERE id = OLD.team_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on students table
DROP TRIGGER IF EXISTS sync_student_points_trigger ON public.students;
CREATE TRIGGER sync_student_points_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_student_points_to_team();