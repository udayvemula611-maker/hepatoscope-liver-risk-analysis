import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL() {
    const { data, error } = await supabase.rpc('exec_sql', {
        query: `
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can view all reports" ON public.liver_reports;
CREATE POLICY "Admins can view all reports" ON public.liver_reports FOR SELECT USING (true);
` });

    if (error) {
        console.error("Error executing SQL via RPC:", error);
    } else {
        console.log("SQL executed successfully. Policies updated.");
    }
}

runSQL();
