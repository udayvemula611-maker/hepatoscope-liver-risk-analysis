-- Phase 12: Update Profiles and Create Prescriptions Table

-- 1. Update Profiles Table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS assigned_doctor uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS health_status text,
ADD COLUMN IF NOT EXISTS last_analysis_date timestamp with time zone;

-- 2. Create Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id uuid REFERENCES public.liver_reports(id) ON DELETE CASCADE,
    doctor_id uuid REFERENCES public.profiles(id),
    patient_id uuid REFERENCES public.profiles(id),
    prescription_text text,
    follow_up_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(report_id) -- One prescription per report
);

-- 3. Enable RLS on Prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- 4. Prescriptions Policies
-- Doctors can insert/view prescriptions they created
DROP POLICY IF EXISTS "Doctors can manage their prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors can manage their prescriptions"
  ON public.prescriptions FOR ALL
  USING ( auth.uid() = doctor_id );

-- Patients can view their own prescriptions
DROP POLICY IF EXISTS "Patients can view own prescriptions" ON public.prescriptions;
CREATE POLICY "Patients can view own prescriptions"
  ON public.prescriptions FOR SELECT
  USING ( auth.uid() = patient_id );

-- Admins can view all prescriptions
DROP POLICY IF EXISTS "Admins can view all prescriptions" ON public.prescriptions;
CREATE POLICY "Admins can view all prescriptions"
  ON public.prescriptions FOR SELECT
  USING ( 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' 
  );
