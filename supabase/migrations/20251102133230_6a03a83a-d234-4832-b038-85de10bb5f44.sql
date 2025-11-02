-- Create videos table for festival highlights
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to videos
CREATE POLICY "Allow public read access to videos"
  ON public.videos
  FOR SELECT
  USING (true);

-- Admins can manage videos
CREATE POLICY "Admins can manage videos"
  ON public.videos
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for video thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-thumbnails', 'video-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for video thumbnails
CREATE POLICY "Public can view video thumbnails"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'video-thumbnails');

CREATE POLICY "Admins can upload video thumbnails"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'video-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update video thumbnails"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'video-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete video thumbnails"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'video-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));