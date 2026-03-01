import { redirect } from 'next/navigation';
import { checkRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import AdminAnalytics from '@/components/AdminAnalytics';
import ReportCard from '@/components/ReportCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, FileText, AlertCircle } from 'lucide-react';
import * as motion from 'framer-motion/client';

export default async function AdminDashboard() {
    const user = await checkRole(['admin']);
    if (!user) {
        redirect('/login');
    }

    // Use standard supabase-js client to guarantee no user cookies are attached, forcing true Service Role access
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: users } = await supabaseAdmin.from('profiles').select('*');
    const { data: reports } = await supabaseAdmin.from('liver_reports').select('*').order('created_at', { ascending: false });

    const totalDoctors = users?.filter(u => u.role === 'doctor').length || 0;
    const totalPatients = users?.filter(u => u.role === 'patient').length || 0;
    const totalReports = reports?.length || 0;
    const highRiskReports = reports?.filter(r => r.risk_level === 'High').length || 0;

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <Sidebar role="admin" />
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-extrabold tracking-tight text-primary mb-8"
                >
                    System Overview
                </motion.h1>

                {/* Top KPI Cards */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm border-0 font-medium text-muted-foreground uppercase">Total Doctors</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-extrabold text-[#3B82F6]">{totalDoctors}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm border-0 font-medium text-muted-foreground uppercase">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-extrabold text-[#1E3A8A]">{totalPatients}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm border-0 font-medium text-muted-foreground uppercase">Total Reports</CardTitle>
                            <FileText className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-extrabold text-gray-900">{totalReports}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-destructive">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm border-0 font-medium text-destructive uppercase">High Risk Cases</CardTitle>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-extrabold text-destructive">{highRiskReports}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Analytics Charts */}
                <AdminAnalytics reports={reports || []} users={users || []} />

                {/* Recent Reports Listing */}
                <h2 className="text-xl font-bold mb-4 text-[#1E3A8A]">Recent Enterprise Reports</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reports?.slice(0, 9).map(report => (
                        <ReportCard key={report.id} report={report} />
                    ))}
                    {(!reports || reports.length === 0) && (
                        <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                            No reports generated on the platform yet.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
