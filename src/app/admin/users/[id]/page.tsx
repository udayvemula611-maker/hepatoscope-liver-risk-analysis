import { redirect, notFound } from 'next/navigation';
import { checkRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReportCard from '@/components/ReportCard';
import * as motion from 'framer-motion/client';

export default async function AdminUserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const adminUser = await checkRole(['admin']);
    if (!adminUser) redirect('/login');

    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch Target User Profile
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
    if (!profile) return notFound();

    // Fetch related reports (either as doctor or patient)
    const { data: reports } = await supabaseAdmin
        .from('liver_reports')
        .select('*')
        .or(`doctor_id.eq.${profile.id},patient_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

    // Fetch Assigned Doctor Name if this is a patient
    let assignedDoctorName = 'None';
    if (profile.role === 'patient' && profile.assigned_doctor) {
        const { data: dr } = await supabaseAdmin.from('profiles').select('full_name').eq('id', profile.assigned_doctor).single();
        if (dr) assignedDoctorName = dr.full_name;
    }

    const totalReports = reports?.length || 0;
    const highRiskReports = reports?.filter(r => r.risk_level === 'High').length || 0;

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <Sidebar role="admin" />
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Link href="/admin/users" className="flex items-center text-sm text-[#3B82F6] hover:text-[#1E3A8A] font-medium mb-6 transition-colors w-fit">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
                    </Link>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-extrabold tracking-tight text-primary">{profile.full_name || 'Anonymous User'}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${profile.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                    profile.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                    {profile.role}
                                </span>
                            </div>
                            <p className="text-muted-foreground">{profile.email}</p>

                            <div className="mt-6 flex gap-8">
                                {profile.role === 'patient' && (
                                    <>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Age</p>
                                            <p className="font-medium">{profile.age || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Gender</p>
                                            <p className="font-medium">{profile.gender || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Assigned Doctor</p>
                                            <p className="font-medium text-blue-700">{assignedDoctorName}</p>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Joined Date</p>
                                    <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Reports {profile.role === 'doctor' ? 'Generated' : 'Received'}</p>
                            <p className="text-4xl font-extrabold text-primary mt-2">{totalReports}</p>
                        </div>
                        {profile.role === 'doctor' && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">High Risk Diagnoses</p>
                                <p className="text-4xl font-extrabold text-red-600 mt-2">{highRiskReports}</p>
                            </div>
                        )}
                        {profile.role === 'patient' && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Latest Risk Level</p>
                                <p className={`text-2xl font-extrabold mt-2 ${reports?.[0]?.risk_level === 'High' ? 'text-red-600' :
                                    reports?.[0]?.risk_level === 'Moderate' ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                    {reports?.[0]?.risk_level ? reports[0].risk_level.toUpperCase() : 'N/A'}
                                </p>
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-bold mb-4 text-primary">Report History</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {reports?.map(report => (
                            <ReportCard key={report.id} report={report} />
                        ))}
                        {(!reports || reports.length === 0) && (
                            <div className="col-span-full p-8 text-center text-muted-foreground bg-white rounded-xl border border-dashed border-gray-300">
                                No active medical reports found for this user.
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}


