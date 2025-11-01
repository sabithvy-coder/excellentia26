-- Add optional link_url columns
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS link_url text;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS link_url text;

-- Allow public to insert into gallery and news to fix RLS errors when uploading via client
-- Note: Keep read access public; manage via admin UI on frontend
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'gallery' AND policyname = 'Allow public to insert into gallery'
  ) THEN
    CREATE POLICY "Allow public to insert into gallery"
    ON public.gallery
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'news' AND policyname = 'Allow public to insert into news'
  ) THEN
    CREATE POLICY "Allow public to insert into news"
    ON public.news
    FOR INSERT
    WITH CHECK (true);
  END IF;
END$$;

-- Unified trigger function to keep team (and student) points in sync on INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION public.update_team_points_all()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    -- Reverse the contributions
    IF OLD.first_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points - COALESCE(OLD.first_place_points,0) WHERE id = OLD.first_place_team;
      UPDATE public.students SET points = points - COALESCE(OLD.first_place_points,0)
        WHERE name = OLD.first_place_name AND team_id = OLD.first_place_team;
    END IF;

    IF OLD.second_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points - COALESCE(OLD.second_place_points,0) WHERE id = OLD.second_place_team;
      UPDATE public.students SET points = points - COALESCE(OLD.second_place_points,0)
        WHERE name = OLD.second_place_name AND team_id = OLD.second_place_team;
    END IF;

    IF OLD.third_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points - COALESCE(OLD.third_place_points,0) WHERE id = OLD.third_place_team;
      UPDATE public.students SET points = points - COALESCE(OLD.third_place_points,0)
        WHERE name = OLD.third_place_name AND team_id = OLD.third_place_team;
    END IF;

    IF OLD.additional_grades IS NOT NULL THEN
      FOR grade_item IN SELECT * FROM jsonb_array_elements(OLD.additional_grades)
      LOOP
        IF (grade_item->>'team') IS NOT NULL THEN
          UPDATE public.teams 
          SET points = points - COALESCE((grade_item->>'points')::integer,0)
          WHERE id = (grade_item->>'team')::uuid;

          UPDATE public.students 
          SET points = points - COALESCE((grade_item->>'points')::integer,0)
          WHERE name = grade_item->>'name' AND team_id = (grade_item->>'team')::uuid;
        END IF;
      END LOOP;
    END IF;

    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Subtract old
    IF OLD.first_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points - COALESCE(OLD.first_place_points,0) WHERE id = OLD.first_place_team;
      UPDATE public.students SET points = points - COALESCE(OLD.first_place_points,0)
        WHERE name = OLD.first_place_name AND team_id = OLD.first_place_team;
    END IF;
    IF OLD.second_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points - COALESCE(OLD.second_place_points,0) WHERE id = OLD.second_place_team;
      UPDATE public.students SET points = points - COALESCE(OLD.second_place_points,0)
        WHERE name = OLD.second_place_name AND team_id = OLD.second_place_team;
    END IF;
    IF OLD.third_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points - COALESCE(OLD.third_place_points,0) WHERE id = OLD.third_place_team;
      UPDATE public.students SET points = points - COALESCE(OLD.third_place_points,0)
        WHERE name = OLD.third_place_name AND team_id = OLD.third_place_team;
    END IF;
    IF OLD.additional_grades IS NOT NULL THEN
      FOR grade_item IN SELECT * FROM jsonb_array_elements(OLD.additional_grades)
      LOOP
        IF (grade_item->>'team') IS NOT NULL THEN
          UPDATE public.teams 
          SET points = points - COALESCE((grade_item->>'points')::integer,0)
          WHERE id = (grade_item->>'team')::uuid;

          UPDATE public.students 
          SET points = points - COALESCE((grade_item->>'points')::integer,0)
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
$$;

-- Create triggers for INSERT/UPDATE/DELETE on results
DROP TRIGGER IF EXISTS after_results_insert ON public.results;
DROP TRIGGER IF EXISTS after_results_update ON public.results;
DROP TRIGGER IF EXISTS after_results_delete ON public.results;

CREATE TRIGGER after_results_insert
AFTER INSERT ON public.results
FOR EACH ROW EXECUTE FUNCTION public.update_team_points_all();

CREATE TRIGGER after_results_update
AFTER UPDATE ON public.results
FOR EACH ROW EXECUTE FUNCTION public.update_team_points_all();

CREATE TRIGGER after_results_delete
AFTER DELETE ON public.results
FOR EACH ROW EXECUTE FUNCTION public.update_team_points_all();