-- Add is_visible column to results table
ALTER TABLE public.results 
ADD COLUMN is_visible boolean NOT NULL DEFAULT true;