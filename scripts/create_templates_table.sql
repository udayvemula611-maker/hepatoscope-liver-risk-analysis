-- Create the 'report_templates' table
CREATE TABLE IF NOT EXISTS public.report_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hospital_name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#1E3A8A',
    disclaimer_text TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure only one template is active at a time (Optional logic usually handled in API, but good for data integrity)
CREATE UNIQUE INDEX single_active_template ON public.report_templates (is_active) WHERE is_active = true;

-- Ensure RLS is enabled
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- Policies for report_templates
-- 1. Everyone (Doctors and Patients) can SELECT the active template to render their reports
DROP POLICY IF EXISTS "Anyone can view templates" ON public.report_templates;
CREATE POLICY "Anyone can view templates" 
    ON public.report_templates FOR SELECT 
    USING (true);

-- 2. Only Admins can insert, update, or delete templates
DROP POLICY IF EXISTS "Admins can manage templates" ON public.report_templates;
CREATE POLICY "Admins can manage templates" 
    ON public.report_templates FOR ALL 
    USING ( 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' 
    );
