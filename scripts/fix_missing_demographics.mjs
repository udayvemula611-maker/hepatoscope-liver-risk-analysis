import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function repairDefaults() {
    const { data: profiles, error } = await supabaseAdmin.from('profiles').select('*');
    let count = 0;

    for (const p of profiles) {
        if (!p.age || !p.gender) {
            await supabaseAdmin.from('profiles').update({
                age: p.age || 35,
                gender: p.gender || 'Other'
            }).eq('id', p.id);
            count++;
            console.log("Updated:", p.full_name);
        }
    }
    console.log("Repaired total:", count);
}
repairDefaults();
