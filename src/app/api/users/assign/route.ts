import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const reqCookies = await cookieStore;

        // Verify Admin Access
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return reqCookies.getAll(); },
                    setAll(cookiesToSet) {
                        try { cookiesToSet.forEach(({ name, value, options }) => reqCookies.set(name, value, options)); } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        const body = await request.json();
        const { patient_id, doctor_id } = body;

        if (!patient_id) {
            return NextResponse.json({ error: 'Patient ID is required.' }, { status: 400 });
        }

        const assignId = doctor_id ? doctor_id : null;

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ assigned_doctor: assignId })
            .eq('id', patient_id);

        if (error) {
            console.error('Assignment Error:', error);
            return NextResponse.json({ error: 'Failed to assign doctor.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Patient assignment updated successfully.' }, { status: 200 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
