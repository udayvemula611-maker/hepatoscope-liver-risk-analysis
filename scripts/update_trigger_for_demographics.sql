-- Phase 10: Update User Creation Trigger to handle Age and Gender

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, age, gender)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'patient'),
    (new.raw_user_meta_data->>'age')::integer,
    new.raw_user_meta_data->>'gender'
  );
  RETURN new;
END;
$$;
