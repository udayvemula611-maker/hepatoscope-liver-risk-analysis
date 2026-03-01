import { createClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    // Row Level Security (RLS) ensures:
    // - Doctors see reports they created (where doctor_id = auth.uid()) -> Wait, the policy says this.
    // - Patients see their assigned reports
    // - Admins see all
    const { data: reports, error } = await supabase
        .from('liver_reports')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(reports);
}
