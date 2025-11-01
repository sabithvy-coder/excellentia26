-- Ensure program deletion cascades to results and points are reversed
-- First drop the existing foreign key if it exists
ALTER TABLE public.results DROP CONSTRAINT IF EXISTS results_program_id_fkey;

-- Add foreign key with CASCADE on delete
ALTER TABLE public.results 
ADD CONSTRAINT results_program_id_fkey 
FOREIGN KEY (program_id) 
REFERENCES public.programs(id) 
ON DELETE CASCADE;