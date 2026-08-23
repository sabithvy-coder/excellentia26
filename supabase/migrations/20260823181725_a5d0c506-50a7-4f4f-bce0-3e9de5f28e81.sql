-- 1. Festivals table
CREATE TABLE public.festivals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL UNIQUE,
  title text NOT NULL,
  tagline text,
  status text NOT NULL DEFAULT 'upcoming',
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.festivals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.festivals TO authenticated;
GRANT ALL ON public.festivals TO service_role;

ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to festivals"
  ON public.festivals FOR SELECT USING (true);
CREATE POLICY "Admins can manage festivals"
  ON public.festivals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.festivals (year, title, tagline, status, is_current) VALUES
  (2025, 'Excellentia Arts Fiesta 2025', 'Through The Scrolls', 'archived', false),
  (2026, 'Excellentia Arts Fiesta 2026', 'Unfolding Excellence', 'current', true);

-- 2. Add festival_id to year-specific tables and backfill to 2025
ALTER TABLE public.results ADD COLUMN festival_id uuid REFERENCES public.festivals(id);
ALTER TABLE public.gallery ADD COLUMN festival_id uuid REFERENCES public.festivals(id);
ALTER TABLE public.news ADD COLUMN festival_id uuid REFERENCES public.festivals(id);
ALTER TABLE public.videos ADD COLUMN festival_id uuid REFERENCES public.festivals(id);
ALTER TABLE public.teams ADD COLUMN festival_id uuid REFERENCES public.festivals(id);
ALTER TABLE public.students ADD COLUMN festival_id uuid REFERENCES public.festivals(id);
ALTER TABLE public.reports ADD COLUMN festival_id uuid REFERENCES public.festivals(id);
ALTER TABLE public.result_requests ADD COLUMN festival_id uuid REFERENCES public.festivals(id);
ALTER TABLE public.settings ADD COLUMN festival_id uuid REFERENCES public.festivals(id);

UPDATE public.results SET festival_id = (SELECT id FROM public.festivals WHERE year = 2025);
UPDATE public.gallery SET festival_id = (SELECT id FROM public.festivals WHERE year = 2025);
UPDATE public.news SET festival_id = (SELECT id FROM public.festivals WHERE year = 2025);
UPDATE public.videos SET festival_id = (SELECT id FROM public.festivals WHERE year = 2025);
UPDATE public.teams SET festival_id = (SELECT id FROM public.festivals WHERE year = 2025);
UPDATE public.students SET festival_id = (SELECT id FROM public.festivals WHERE year = 2025);
UPDATE public.reports SET festival_id = (SELECT id FROM public.festivals WHERE year = 2025);
UPDATE public.result_requests SET festival_id = (SELECT id FROM public.festivals WHERE year = 2025);
UPDATE public.settings SET festival_id = (SELECT id FROM public.festivals WHERE year = 2025);

CREATE INDEX idx_results_festival ON public.results(festival_id);
CREATE INDEX idx_gallery_festival ON public.gallery(festival_id);
CREATE INDEX idx_news_festival ON public.news(festival_id);
CREATE INDEX idx_videos_festival ON public.videos(festival_id);
CREATE INDEX idx_teams_festival ON public.teams(festival_id);
CREATE INDEX idx_students_festival ON public.students(festival_id);
CREATE INDEX idx_settings_festival ON public.settings(festival_id);

-- 3. Programs stay shared; record which years they ran in
ALTER TABLE public.programs ADD COLUMN festival_years integer[] NOT NULL DEFAULT ARRAY[]::integer[];
UPDATE public.programs SET festival_years = ARRAY[2025];

-- 4. Scope point sync triggers to the result's own festival
CREATE OR REPLACE FUNCTION public.update_team_points_all()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  grade_item JSONB;
BEGIN
  IF TG_OP IN ('DELETE','UPDATE') THEN
    IF OLD.first_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = GREATEST(0, points - COALESCE(OLD.first_place_points,0)) WHERE id = OLD.first_place_team;
      UPDATE public.students SET points = GREATEST(0, points - COALESCE(OLD.first_place_points,0))
        WHERE name = OLD.first_place_name AND team_id = OLD.first_place_team
          AND (festival_id IS NOT DISTINCT FROM OLD.festival_id OR OLD.festival_id IS NULL);
    END IF;
    IF OLD.second_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = GREATEST(0, points - COALESCE(OLD.second_place_points,0)) WHERE id = OLD.second_place_team;
      UPDATE public.students SET points = GREATEST(0, points - COALESCE(OLD.second_place_points,0))
        WHERE name = OLD.second_place_name AND team_id = OLD.second_place_team
          AND (festival_id IS NOT DISTINCT FROM OLD.festival_id OR OLD.festival_id IS NULL);
    END IF;
    IF OLD.third_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = GREATEST(0, points - COALESCE(OLD.third_place_points,0)) WHERE id = OLD.third_place_team;
      UPDATE public.students SET points = GREATEST(0, points - COALESCE(OLD.third_place_points,0))
        WHERE name = OLD.third_place_name AND team_id = OLD.third_place_team
          AND (festival_id IS NOT DISTINCT FROM OLD.festival_id OR OLD.festival_id IS NULL);
    END IF;
    IF OLD.additional_grades IS NOT NULL THEN
      FOR grade_item IN SELECT * FROM jsonb_array_elements(OLD.additional_grades)
      LOOP
        IF (grade_item->>'team') IS NOT NULL THEN
          UPDATE public.teams SET points = GREATEST(0, points - COALESCE((grade_item->>'points')::integer,0))
            WHERE id = (grade_item->>'team')::uuid;
          UPDATE public.students SET points = GREATEST(0, points - COALESCE((grade_item->>'points')::integer,0))
            WHERE name = grade_item->>'name' AND team_id = (grade_item->>'team')::uuid
              AND (festival_id IS NOT DISTINCT FROM OLD.festival_id OR OLD.festival_id IS NULL);
        END IF;
      END LOOP;
    END IF;
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
  END IF;

  IF TG_OP IN ('INSERT','UPDATE') THEN
    IF NEW.first_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points + COALESCE(NEW.first_place_points,0) WHERE id = NEW.first_place_team;
      UPDATE public.students SET points = points + COALESCE(NEW.first_place_points,0)
        WHERE name = NEW.first_place_name AND team_id = NEW.first_place_team
          AND (festival_id IS NOT DISTINCT FROM NEW.festival_id OR NEW.festival_id IS NULL);
    END IF;
    IF NEW.second_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points + COALESCE(NEW.second_place_points,0) WHERE id = NEW.second_place_team;
      UPDATE public.students SET points = points + COALESCE(NEW.second_place_points,0)
        WHERE name = NEW.second_place_name AND team_id = NEW.second_place_team
          AND (festival_id IS NOT DISTINCT FROM NEW.festival_id OR NEW.festival_id IS NULL);
    END IF;
    IF NEW.third_place_team IS NOT NULL THEN
      UPDATE public.teams SET points = points + COALESCE(NEW.third_place_points,0) WHERE id = NEW.third_place_team;
      UPDATE public.students SET points = points + COALESCE(NEW.third_place_points,0)
        WHERE name = NEW.third_place_name AND team_id = NEW.third_place_team
          AND (festival_id IS NOT DISTINCT FROM NEW.festival_id OR NEW.festival_id IS NULL);
    END IF;
    IF NEW.additional_grades IS NOT NULL THEN
      FOR grade_item IN SELECT * FROM jsonb_array_elements(NEW.additional_grades)
      LOOP
        IF (grade_item->>'team') IS NOT NULL THEN
          UPDATE public.teams SET points = points + COALESCE((grade_item->>'points')::integer,0)
            WHERE id = (grade_item->>'team')::uuid;
          UPDATE public.students SET points = points + COALESCE((grade_item->>'points')::integer,0)
            WHERE name = grade_item->>'name' AND team_id = (grade_item->>'team')::uuid
              AND (festival_id IS NOT DISTINCT FROM NEW.festival_id OR NEW.festival_id IS NULL);
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Remove duplicate legacy trigger that double-counted points on insert
DROP TRIGGER IF EXISTS trigger_update_team_points ON public.results;