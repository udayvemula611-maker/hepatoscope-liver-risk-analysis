import { redirect } from 'next/navigation';
import { checkRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import LiverForm from '@/components/LiverForm';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export default async function NewReportPage() {
    const user = await checkRole(['doctor']);
    if (!user) {
        redirect('/login');
    }

    // Use Service Role to bypass RLS, but strictly filter for patients assigned to THIS doctor
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: patients } = await supabaseAdmin.from('profiles').select('id, full_name, role, age, gender, created_at').eq('role', 'patient').eq('assigned_doctor', user.id).order('created_at', { ascending: false });

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <Sidebar role="doctor" />
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">New Analysis</h1>
                    <p className="text-gray-500">Enter patient lab values to generate an AI-assisted risk report.</p>
                </div>

                <LiverForm patients={patients || []} />
            </main>
        </div>
    );
}
