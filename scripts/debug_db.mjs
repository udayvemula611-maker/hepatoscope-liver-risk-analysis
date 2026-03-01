import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual simple parsing of .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVariables = {};
envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
        envVariables[key.trim()] = values.join('=').trim();
    }
});

const supabaseUrl = envVariables['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVariables['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials!");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkDb() {
    console.log("Checking Auth Users...");
    const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
    if (authErr) console.error(authErr);
    else console.log(`Total Auth Users: ${authUsers.users.length}`);

    console.log("Checking Profiles...");
    const { data: profiles, error: profErr } = await supabaseAdmin.from('profiles').select('*');
    if (profErr) console.error(profErr);
    else {
        console.log(`Total Profiles: ${profiles.length}`);
        console.log("Profiles: ", profiles);
    }
}

checkDb();
