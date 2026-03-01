import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const reqCookies = await cookieStore;

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

        const body = await request.json();
        const { report_id, prescription_text, follow_up_date } = body;

        if (!report_id || !prescription_text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get the report to find patient_id and verify ownership
        const { data: report, error: reportError } = await supabaseAdmin
            .from('liver_reports')
            .select('patient_id, doctor_id')
            .eq('id', report_id)
            .single();

        if (reportError || !report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        // Only the doctor who created the report can add a prescription
        if (report.doctor_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden. You do not own this report.' }, { status: 403 });
        }

        // Insert prescription
        const { data: prescription, error: insertError } = await supabaseAdmin
            .from('prescriptions')
            .insert({
                report_id,
                doctor_id: user.id,
                patient_id: report.patient_id,
                prescription_text,
                follow_up_date: follow_up_date || null
            })
            .select()
            .single();

        if (insertError) {
            if (insertError.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'A prescription already exists for this report.' }, { status: 400 });
            }
            console.error('Prescription Insert Error:', insertError);
            return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Prescription created successfully.', prescription }, { status: 200 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
