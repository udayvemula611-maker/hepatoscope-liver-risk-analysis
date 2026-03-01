import { createClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    // RLS will automatically filter this based on the authenticated user's role and policies.
    // Admins see all users. Normal users see themselves.
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(users);
}
