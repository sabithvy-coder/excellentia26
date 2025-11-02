-- Create donations table to store donation details
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT,
  amount INTEGER NOT NULL,
  payment_id TEXT,
  order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Allow public to insert donations
CREATE POLICY "Allow public to insert donations"
ON public.donations
FOR INSERT
WITH CHECK (true);

-- Admins can view all donations
CREATE POLICY "Admins can view all donations"
ON public.donations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update donations
CREATE POLICY "Admins can update donations"
ON public.donations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));