-- Create storage bucket for result posters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('result-posters', 'result-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Add poster_urls column to results table
ALTER TABLE public.results 
ADD COLUMN IF NOT EXISTS poster_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create storage policies for result posters
CREATE POLICY "Public can view result posters" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'result-posters');

CREATE POLICY "Admins can upload result posters" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'result-posters' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update result posters" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'result-posters' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete result posters" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'result-posters' 
  AND has_role(auth.uid(), 'admin'::app_role)
);