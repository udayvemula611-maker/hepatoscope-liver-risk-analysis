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
    console.log("Adding histology column to liver_reports table...");
    const { data, error } = await supabase.rpc('exec_sql', {
        query: `
ALTER TABLE public.liver_reports ADD COLUMN IF NOT EXISTS histology TEXT DEFAULT 'None';
` });

    if (error) {
        console.error("Error executing SQL via RPC:");
        console.error(error);
        if (error.code === '42883') {
            console.log("It seems the 'exec_sql' RPC function is not installed on this database.");
            console.log("Please run this command manually in the Supabase SQL Editor:");
            console.log("ALTER TABLE public.liver_reports ADD COLUMN IF NOT EXISTS histology TEXT DEFAULT 'None';");
        }
    } else {
        console.log("SQL executed successfully. Column 'histology' added to 'liver_reports'.");
    }
}

runSQL();
