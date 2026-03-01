import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPatient() {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', 'eba0e77e-1ed0-4281-a1bd-f5db2aa4f087').single();
    if (error) console.error(error);
    console.log("PROFILE:", data);
}
checkPatient();
