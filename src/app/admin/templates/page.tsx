import { redirect } from 'next/navigation';
import { checkRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import TemplateEditorClient from './TemplateEditorClient';

export default async function AdminTemplatesPage() {
    const user = await checkRole(['admin']);
    if (!user) {
        redirect('/login');
    }

    // Fetch existing templates using Service Role
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: templates } = await supabaseAdmin
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <Sidebar role="admin" />
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hospital Templates</h1>
                        <p className="text-gray-500">Manage branding and styling generated on PDF patient reports.</p>
                    </div>
                </div>

                <TemplateEditorClient templates={templates || []} />
            </main>
        </div>
    );
}
