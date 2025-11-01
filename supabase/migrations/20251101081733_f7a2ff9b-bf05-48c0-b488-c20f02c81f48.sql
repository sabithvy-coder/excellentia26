-- Add check constraints for positive points
ALTER TABLE public.teams ADD CONSTRAINT teams_points_positive CHECK (points >= 0);
ALTER TABLE public.students ADD CONSTRAINT students_points_positive CHECK (points >= 0);

-- Extend reports table to handle gallery and news reports
ALTER TABLE public.reports 
  ADD COLUMN gallery_id uuid REFERENCES public.gallery(id) ON DELETE CASCADE,
  ADD COLUMN news_id uuid REFERENCES public.news(id) ON DELETE CASCADE,
  ALTER COLUMN result_id DROP NOT NULL;

-- Add a check to ensure only one type of report is created
ALTER TABLE public.reports ADD CONSTRAINT reports_single_type_check 
  CHECK (
    (result_id IS NOT NULL AND gallery_id IS NULL AND news_id IS NULL) OR
    (result_id IS NULL AND gallery_id IS NOT NULL AND news_id IS NULL) OR
    (result_id IS NULL AND gallery_id IS NULL AND news_id IS NOT NULL)
  );