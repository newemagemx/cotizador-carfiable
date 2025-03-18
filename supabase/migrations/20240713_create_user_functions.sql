
-- Create functions to interact with the users table

-- Function to get a user by phone number
CREATE OR REPLACE FUNCTION public.get_user_by_phone(p_phone TEXT, p_country_code TEXT)
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.users
  WHERE phone = p_phone AND country_code = p_country_code
  LIMIT 1;
END;
$$;

-- Function to create a new user
CREATE OR REPLACE FUNCTION public.create_user(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_country_code TEXT,
  p_role TEXT DEFAULT 'both',
  p_last_verified TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user public.users;
BEGIN
  INSERT INTO public.users (
    name,
    email,
    phone,
    country_code,
    role,
    last_verified
  )
  VALUES (
    p_name,
    p_email,
    p_phone,
    p_country_code,
    p_role,
    p_last_verified
  )
  RETURNING * INTO new_user;
  
  RETURN new_user;
END;
$$;

-- Function to update an existing user
CREATE OR REPLACE FUNCTION public.update_user(
  p_id UUID,
  p_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_last_verified TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_user public.users;
BEGIN
  UPDATE public.users
  SET
    name = COALESCE(p_name, name),
    email = COALESCE(p_email, email),
    phone = COALESCE(p_phone, phone),
    country_code = COALESCE(p_country_code, country_code),
    role = COALESCE(p_role, role),
    last_verified = COALESCE(p_last_verified, last_verified),
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO updated_user;
  
  RETURN updated_user;
END;
$$;

-- Function to get a user by ID
CREATE OR REPLACE FUNCTION public.get_user_by_id(p_id UUID)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_user public.users;
BEGIN
  SELECT * INTO found_user
  FROM public.users
  WHERE id = p_id
  LIMIT 1;
  
  RETURN found_user;
END;
$$;
