import { redirect } from 'next/navigation';
import { checkRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import ReportCard from '@/components/ReportCard';
import { createClient } from '@/lib/supabaseServer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import * as motion from 'framer-motion/client';

export default async function DoctorDashboard() {
    const user = await checkRole(['doctor']);
    if (!user) {
        redirect('/login');
    }

    const supabase = await createClient();
    // RLS will ensure we only get the doctor's own created reports
    const { data: reports } = await supabase
        .from('liver_reports')
        .select('*')
        .order('created_at', { ascending: false });

    // Count assigned patients using the server client directly or admin client for now since we haven't updated RLS for patient fetching by assigned doctor.
    // Actually, creating a specific supabaseAdmin is safer for now to get assigned patients.
    const { createClient: createAdmin } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: assignedPatients } = await supabaseAdmin.from('profiles').select('*').eq('assigned_doctor', user.id);
    const patientCount = assignedPatients?.length || 0;

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <Sidebar role="doctor" />
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary mb-2">Welcome, Dr. {user.full_name?.split(' ')[0] || ''}</h1>
                    <p className="text-muted-foreground mb-8">Manage your patient liver analysis reports here.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm border-0 font-medium text-muted-foreground uppercase">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-extrabold text-[#3B82F6]">{patientCount}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm border-0 font-medium text-muted-foreground uppercase">Total Reports</CardTitle>
                            <FileText className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-extrabold text-[#1E3A8A]">{reports?.length || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-destructive">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm border-0 font-medium text-destructive uppercase">High Risk</CardTitle>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-extrabold text-destructive">{reports?.filter(r => r.risk_level === 'High').length || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm border-0 font-medium text-amber-600 uppercase">Moderate</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-extrabold text-amber-600">{reports?.filter(r => r.risk_level === 'Moderate').length || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm border-0 font-medium text-green-700 uppercase">Low Risk</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-extrabold text-green-700">{reports?.filter(r => r.risk_level === 'Low').length || 0}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-primary">Recent Reports</h2>
                    </div>

                    {reports && reports.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No reports yet</h3>
                            <p className="text-gray-500 mb-4">You haven't created any patient risk analysis reports.</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
