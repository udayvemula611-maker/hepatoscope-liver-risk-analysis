import { redirect } from 'next/navigation';
import { checkRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import ReportCard from '@/components/ReportCard';
import { createClient } from '@/lib/supabaseServer';
import * as motion from 'framer-motion/client';

export default async function PatientDashboard() {
    const user = await checkRole(['patient']);
    if (!user) {
        redirect('/login');
    }

    const supabase = await createClient();
    // RLS will ensure we only get the patient's own assigned reports
    const { data: reports } = await supabase
        .from('liver_reports')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <Sidebar role="patient" />
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary mb-2">Your Health Dashboard</h1>
                    <p className="text-muted-foreground mb-8 font-medium">View records of your Liver Function Tests here.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-primary">Your Reports ({reports?.length || 0})</h2>
                    </div>

                    {reports && reports.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border shadow-sm">
                            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">No reports available</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">Your doctor hasn't uploaded any reports for you yet. Your results will appear here once they are ready.</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
