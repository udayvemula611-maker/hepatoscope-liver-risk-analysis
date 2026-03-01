-- Ensure RLS is enabled on the tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liver_reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- 1. Everyone can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

-- 2. Admins can view all profiles
-- Note: Replaced subquery with checking a JWT claim or simply removing the subquery for now 
-- to avoid infinite recursion. Users with 'service_role' bypass RLS entirely anyway.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING ( 
    auth.jwt() ->> 'role' = 'admin'
  );

-- Liver Reports Policies
-- 1. Doctors can insert/view records they created
DROP POLICY IF EXISTS "Doctors can manage their assigned reports" ON public.liver_reports;
CREATE POLICY "Doctors can manage their assigned reports"
  ON public.liver_reports FOR ALL
  USING ( auth.uid() = doctor_id );

-- 2. Patients can view their own reports
DROP POLICY IF EXISTS "Patients can view own reports" ON public.liver_reports;
CREATE POLICY "Patients can view own reports"
  ON public.liver_reports FOR SELECT
  USING ( auth.uid() = patient_id );

-- 3. Admins can view all reports
DROP POLICY IF EXISTS "Admins can view all reports" ON public.liver_reports;
CREATE POLICY "Admins can view all reports"
  ON public.liver_reports FOR SELECT
  USING ( 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' 
  );

-- Function to handle new user sign ups and create a default profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'patient') -- default role is patient
  );
  RETURN new;
END;
$$;

-- Trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
