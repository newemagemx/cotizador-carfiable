
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT '+52',
  role TEXT NOT NULL DEFAULT 'both',
  last_verified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(phone, country_code)
);

-- Create index on phone number for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users (phone, country_code);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to users" 
  ON public.users 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow user to update own data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Allow user insertion" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);
