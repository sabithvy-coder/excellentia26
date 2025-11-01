-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert the four teams
INSERT INTO public.teams (name) VALUES 
  ('Marakish'),
  ('Dimashq'),
  ('Undulus'),
  ('Qudus');

-- Create programs table
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  venue TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create results table
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  first_place_name TEXT NOT NULL,
  first_place_team UUID REFERENCES public.teams(id),
  first_place_points INTEGER DEFAULT 0,
  second_place_name TEXT NOT NULL,
  second_place_team UUID REFERENCES public.teams(id),
  second_place_points INTEGER DEFAULT 0,
  third_place_name TEXT NOT NULL,
  third_place_team UUID REFERENCES public.teams(id),
  third_place_points INTEGER DEFAULT 0,
  another_grade_name TEXT,
  another_grade_team UUID REFERENCES public.teams(id),
  another_grade_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create news table
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create gallery table
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create result requests table
CREATE TABLE public.result_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID REFERENCES public.results(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  issue TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert admin user (password: throughthescrolls - hashed)
-- Note: In production, use proper password hashing. This is a simple example.
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('excellentia25', crypt('throughthescrolls', gen_salt('bf')));

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Allow public read access to news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Allow public read access to gallery" ON public.gallery FOR SELECT USING (true);

-- Allow public to insert requests and reports
CREATE POLICY "Allow public to insert result requests" ON public.result_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to insert reports" ON public.reports FOR INSERT WITH CHECK (true);

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Create storage policy for gallery
CREATE POLICY "Allow public read access to gallery images" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

-- Create function to update team points
CREATE OR REPLACE FUNCTION update_team_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update first place team points
  IF NEW.first_place_team IS NOT NULL THEN
    UPDATE public.teams 
    SET points = points + NEW.first_place_points 
    WHERE id = NEW.first_place_team;
  END IF;
  
  -- Update second place team points
  IF NEW.second_place_team IS NOT NULL THEN
    UPDATE public.teams 
    SET points = points + NEW.second_place_points 
    WHERE id = NEW.second_place_team;
  END IF;
  
  -- Update third place team points
  IF NEW.third_place_team IS NOT NULL THEN
    UPDATE public.teams 
    SET points = points + NEW.third_place_points 
    WHERE id = NEW.third_place_team;
  END IF;
  
  -- Update another grade team points if exists
  IF NEW.another_grade_team IS NOT NULL THEN
    UPDATE public.teams 
    SET points = points + NEW.another_grade_points 
    WHERE id = NEW.another_grade_team;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic point updates
CREATE TRIGGER trigger_update_team_points
AFTER INSERT ON public.results
FOR EACH ROW
EXECUTE FUNCTION update_team_points();