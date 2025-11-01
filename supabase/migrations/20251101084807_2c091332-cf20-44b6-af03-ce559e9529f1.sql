-- Drop the constraint that prevents negative points temporarily during deletion
-- We'll ensure points never go below 0 in the trigger instead
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_points_positive;

-- Add a new constraint that allows 0 or positive only
ALTER TABLE public.teams ADD CONSTRAINT teams_points_non_negative CHECK (points >= 0);

-- Update the trigger function to handle point reversal safely
CREATE OR REPLACE FUNCTION public.update_team_points_all()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  grade_item JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- First place
    IF NEW.first_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points + COALESCE(NEW.first_place_points,0) WHERE id = NEW.first_place_team;
      UPDATE public.students SET points = points + COALESCE(NEW.first_place_points,0)
        WHERE name = NEW.first_place_name AND team_id = NEW.first_place_team;
    END IF;

    -- Second place
    IF NEW.second_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points + COALESCE(NEW.second_place_points,0) WHERE id = NEW.second_place_team;
      UPDATE public.students SET points = points + COALESCE(NEW.second_place_points,0)
        WHERE name = NEW.second_place_name AND team_id = NEW.second_place_team;
    END IF;

    -- Third place
    IF NEW.third_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points + COALESCE(NEW.third_place_points,0) WHERE id = NEW.third_place_team;
      UPDATE public.students SET points = points + COALESCE(NEW.third_place_points,0)
        WHERE name = NEW.third_place_name AND team_id = NEW.third_place_team;
    END IF;

    -- Additional grades
    IF NEW.additional_grades IS NOT NULL THEN
      FOR grade_item IN SELECT * FROM jsonb_array_elements(NEW.additional_grades)
      LOOP
        IF (grade_item->>'team') IS NOT NULL THEN
          UPDATE public.teams 
          SET points = points + COALESCE((grade_item->>'points')::integer,0)
          WHERE id = (grade_item->>'team')::uuid;

          UPDATE public.students 
          SET points = points + COALESCE((grade_item->>'points')::integer,0)
          WHERE name = grade_item->>'name' AND team_id = (grade_item->>'team')::uuid;
        END IF;
      END LOOP;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Reverse the contributions, ensuring we never go below 0
    IF OLD.first_place_team IS NOT NULL THEN
      UPDATE public.teams 
      SET points = GREATEST(0, points - COALESCE(OLD.first_place_points,0)) 
      WHERE id = OLD.first_place_team;
      UPDATE public.students 
      SET points = GREATEST(0, points - COALESCE(OLD.first_place_points,0))
      WHERE name = OLD.first_place_name AND team_id = OLD.first_place_team;
    END IF;

    IF OLD.second_place_team IS NOT NULL THEN
      UPDATE public.teams 
      SET points = GREATEST(0, points - COALESCE(OLD.second_place_points,0)) 
      WHERE id = OLD.second_place_team;
      UPDATE public.students 
      SET points = GREATEST(0, points - COALESCE(OLD.second_place_points,0))
      WHERE name = OLD.second_place_name AND team_id = OLD.second_place_team;
    END IF;

    IF OLD.third_place_team IS NOT NULL THEN
      UPDATE public.teams 
      SET points = GREATEST(0, points - COALESCE(OLD.third_place_points,0)) 
      WHERE id = OLD.third_place_team;
      UPDATE public.students 
      SET points = GREATEST(0, points - COALESCE(OLD.third_place_points,0))
      WHERE name = OLD.third_place_name AND team_id = OLD.third_place_team;
    END IF;

    IF OLD.additional_grades IS NOT NULL THEN
      FOR grade_item IN SELECT * FROM jsonb_array_elements(OLD.additional_grades)
      LOOP
        IF (grade_item->>'team') IS NOT NULL THEN
          UPDATE public.teams 
          SET points = GREATEST(0, points - COALESCE((grade_item->>'points')::integer,0))
          WHERE id = (grade_item->>'team')::uuid;

          UPDATE public.students 
          SET points = GREATEST(0, points - COALESCE((grade_item->>'points')::integer,0))
          WHERE name = grade_item->>'name' AND team_id = (grade_item->>'team')::uuid;
        END IF;
      END LOOP;
    END IF;

    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Subtract old (with minimum 0)
    IF OLD.first_place_team IS NOT NULL THEN
      UPDATE public.teams 
      SET points = GREATEST(0, points - COALESCE(OLD.first_place_points,0)) 
      WHERE id = OLD.first_place_team;
      UPDATE public.students 
      SET points = GREATEST(0, points - COALESCE(OLD.first_place_points,0))
      WHERE name = OLD.first_place_name AND team_id = OLD.first_place_team;
    END IF;
    IF OLD.second_place_team IS NOT NULL THEN
      UPDATE public.teams 
      SET points = GREATEST(0, points - COALESCE(OLD.second_place_points,0)) 
      WHERE id = OLD.second_place_team;
      UPDATE public.students 
      SET points = GREATEST(0, points - COALESCE(OLD.second_place_points,0))
      WHERE name = OLD.second_place_name AND team_id = OLD.second_place_team;
    END IF;
    IF OLD.third_place_team IS NOT NULL THEN
      UPDATE public.teams 
      SET points = GREATEST(0, points - COALESCE(OLD.third_place_points,0)) 
      WHERE id = OLD.third_place_team;
      UPDATE public.students 
      SET points = GREATEST(0, points - COALESCE(OLD.third_place_points,0))
      WHERE name = OLD.third_place_name AND team_id = OLD.third_place_team;
    END IF;
    IF OLD.additional_grades IS NOT NULL THEN
      FOR grade_item IN SELECT * FROM jsonb_array_elements(OLD.additional_grades)
      LOOP
        IF (grade_item->>'team') IS NOT NULL THEN
          UPDATE public.teams 
          SET points = GREATEST(0, points - COALESCE((grade_item->>'points')::integer,0))
          WHERE id = (grade_item->>'team')::uuid;

          UPDATE public.students 
          SET points = GREATEST(0, points - COALESCE((grade_item->>'points')::integer,0))
          WHERE name = grade_item->>'name' AND team_id = (grade_item->>'team')::uuid;
        END IF;
      END LOOP;
    END IF;

    -- Add new
    IF NEW.first_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points + COALESCE(NEW.first_place_points,0) WHERE id = NEW.first_place_team;
      UPDATE public.students SET points = points + COALESCE(NEW.first_place_points,0)
        WHERE name = NEW.first_place_name AND team_id = NEW.first_place_team;
    END IF;
    IF NEW.second_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points + COALESCE(NEW.second_place_points,0) WHERE id = NEW.second_place_team;
      UPDATE public.students SET points = points + COALESCE(NEW.second_place_points,0)
        WHERE name = NEW.second_place_name AND team_id = NEW.second_place_team;
    END IF;
    IF NEW.third_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points + COALESCE(NEW.third_place_points,0) WHERE id = NEW.third_place_team;
      UPDATE public.students SET points = points + COALESCE(NEW.third_place_points,0)
        WHERE name = NEW.third_place_name AND team_id = NEW.third_place_team;
    END IF;
    IF NEW.additional_grades IS NOT NULL THEN
      FOR grade_item IN SELECT * FROM jsonb_array_elements(NEW.additional_grades)
      LOOP
        IF (grade_item->>'team') IS NOT NULL THEN
          UPDATE public.teams 
          SET points = points + COALESCE((grade_item->>'points')::integer,0)
          WHERE id = (grade_item->>'team')::uuid;

          UPDATE public.students 
          SET points = points + COALESCE((grade_item->>'points')::integer,0)
          WHERE name = grade_item->>'name' AND team_id = (grade_item->>'team')::uuid;
        END IF;
      END LOOP;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;