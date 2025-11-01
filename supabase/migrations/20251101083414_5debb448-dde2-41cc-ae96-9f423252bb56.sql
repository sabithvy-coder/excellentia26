-- Add RLS policies for gallery bucket to allow public uploads

-- Allow public to view images in gallery bucket
CREATE POLICY "Public can view gallery images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery');

-- Allow public to upload images to gallery bucket
CREATE POLICY "Public can upload to gallery bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'gallery');

-- Allow public to update images in gallery bucket
CREATE POLICY "Public can update gallery images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');

-- Allow public to delete images from gallery bucket
CREATE POLICY "Public can delete gallery images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'gallery');