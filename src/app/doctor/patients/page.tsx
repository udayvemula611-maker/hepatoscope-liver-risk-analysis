import { redirect } from 'next/navigation';
import { checkRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Activity, Clock } from 'lucide-react';
import * as motion from 'framer-motion/client';

export default async function DoctorPatientsPage() {
    const user = await checkRole(['doctor']);
    if (!user) {
        redirect('/login');
    }

    // Use admin client safely server-side to bypass RLS for now to get assigned patients
    // or just direct query. Assuming RLS on profile doesn't allow doctor to see patients assigned to them yet.
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: patients } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('assigned_doctor', user.id)
        .order('full_name', { ascending: true });

    // Fetch all reports for these patients to find the latest
    const patientIds = patients?.map(p => p.id) || [];
    const { data: latestReports } = await supabaseAdmin
        .from('liver_reports')
        .select('id, patient_id, risk_level, created_at')
        .in('patient_id', patientIds)
        .order('created_at', { ascending: false });

    // Helper map
    const reportsMap = new Map();
    latestReports?.forEach(r => {
        if (!reportsMap.has(r.patient_id)) {
            reportsMap.set(r.patient_id, r); // Keeps the most recent one due to standard ordering
        }
    });

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <Sidebar role="doctor" />
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary">My Patients</h1>
                        <p className="text-muted-foreground mt-1">Manage and view the medical history of your assigned patients.</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Details</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Demographics</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Risk Level</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Analysis</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {patients?.map((patient) => {
                                    const latestReport = reportsMap.get(patient.id);

                                    return (
                                        <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                                        {patient.full_name?.substring(0, 2).toUpperCase() || 'PT'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{patient.full_name}</p>
                                                        <p className="text-xs text-gray-500">{patient.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-medium">{patient.age || '--'} yrs, {patient.gender || '--'}</p>
                                            </td>
                                            <td className="p-4">
                                                {latestReport ? (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${latestReport.risk_level === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        latestReport.risk_level === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-green-50 text-green-700 border-green-200'
                                                        }`}>
                                                        <Activity className="w-3 h-3 mr-1" />
                                                        {latestReport.risk_level}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No Analysis</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {latestReport ? (
                                                    <div className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                                                        {new Date(latestReport.created_at).toLocaleDateString()}
                                                    </div>
                                                ) : '--'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link href={`/admin/users/${patient.id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                                                    View History
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(!patients || patients.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            You currently have no assigned patients in the system.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
