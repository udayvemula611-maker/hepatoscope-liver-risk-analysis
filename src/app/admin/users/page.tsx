import { redirect } from 'next/navigation';
import { checkRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import UsersTableClient from '@/app/admin/users/UsersTableClient';

export default async function AdminUsersPage() {
    const user = await checkRole(['admin']);
    if (!user) {
        redirect('/login');
    }

    // Use standard supabase-js client to guarantee no user cookies are attached, forcing true Service Role access
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: users } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false });

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <Sidebar role="admin" />
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#1E3A8A]">User Management</h1>
                        <p className="text-gray-500 mt-1">Create and manage Doctor and Patient accounts for the platform.</p>
                    </div>
                </div>

                <UsersTableClient initialUsers={users || []} />
            </main>
        </div>
    );
}
