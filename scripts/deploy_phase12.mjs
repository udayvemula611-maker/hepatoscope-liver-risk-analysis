import { createClient } from '@supabase/supabase-js';
import process from 'process';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL() {
    const rawSql = fs.readFileSync(path.resolve(process.cwd(), 'scripts/phase12_setup.sql'), 'utf-8');

    const { data, error } = await supabase.rpc('exec_sql', {
        query: rawSql
    });

    if (error) {
        console.error("Error executing SQL via RPC:");
        console.error(error);
    } else {
        console.log("SQL executed successfully.");
    }
}

runSQL();
