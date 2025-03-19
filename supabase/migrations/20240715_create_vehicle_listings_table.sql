
-- Create the vehicle_listings table for storing vehicle valuations
CREATE TABLE IF NOT EXISTS public.vehicle_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year TEXT NOT NULL,
  version TEXT,
  mileage INTEGER NOT NULL,
  condition TEXT NOT NULL,
  location TEXT,
  features TEXT[] DEFAULT '{}',
  estimated_price_quick INTEGER NOT NULL,
  estimated_price_balanced INTEGER NOT NULL,
  estimated_price_premium INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN',
  photos TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  selected_price_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS vehicle_listings_user_id_idx ON public.vehicle_listings(user_id);
CREATE INDEX IF NOT EXISTS vehicle_listings_status_idx ON public.vehicle_listings(status);

-- Enable Row Level Security
ALTER TABLE public.vehicle_listings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own listings
CREATE POLICY "Users can view their own vehicle listings"
  ON public.vehicle_listings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own listings
CREATE POLICY "Users can create their own vehicle listings"
  ON public.vehicle_listings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own listings
CREATE POLICY "Users can update their own vehicle listings"
  ON public.vehicle_listings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own listings
CREATE POLICY "Users can delete their own vehicle listings"
  ON public.vehicle_listings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_listings TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.vehicle_listings_id_seq TO authenticated;
