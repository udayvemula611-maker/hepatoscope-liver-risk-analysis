import { redirect } from 'next/navigation';
import { checkRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import RiskBadge from '@/components/RiskBadge';
import PDFExportButton from '@/components/PDFExportButton';
import ReactMarkdown from 'react-markdown';
import PrescriptionManager from '@/components/PrescriptionManager';
import { createClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import * as motion from 'framer-motion/client';

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Either Doctor or Patient or Admin can view a report (RLS handles exact access)
    const user = await checkRole(['doctor', 'patient', 'admin']);
    if (!user) {
        redirect('/login');
    }

    const supabase = await createClient();

    // Fetch the specific report
    const { data: report, error } = await supabase
        .from('liver_reports')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !report) {
        notFound();
    }

    // Fetch the active Hospital Branding template
    // We use Service Role here as the template should be universally readable but let's stick to safe defaults.
    // The RLS policy for templates allows Anyone to SELECT.
    const { data: template } = await supabase
        .from('report_templates')
        .select('*')
        .eq('is_active', true)
        .single();

    // Fetch Prescription Data
    const { data: prescription } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('report_id', id)
        .single();

    // Fetch Doctor Info
    const { data: doctor } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', report.doctor_id)
        .single();

    const date = new Date(report.created_at).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <Sidebar role={user.role as any} />
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border p-8">
                        <div className="flex justify-between items-start mb-8 pb-8 border-b">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-primary mb-2 leading-tight">
                                    {report.patient_name}'s Analysis
                                </h1>
                                <p className="text-muted-foreground font-medium mb-4">
                                    {report.age} years old &bull; {report.gender} &bull; Generated {date}
                                </p>
                                <PDFExportButton report={report} template={template} />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Overall Risk Score</p>
                                <div className="flex items-center gap-4 justify-end">
                                    <span className="text-5xl font-extrabold text-primary">{report.risk_score}</span>
                                    <RiskBadge level={report.risk_level} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                    Lab Test Values
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-border">
                                    <div className="flex justify-between items-center py-2 border-b border-border">
                                        <span className="text-foreground font-bold">Total Bilirubin</span>
                                        <span className="text-primary font-extrabold">{report.total_bilirubin} <span className="text-sm font-normal text-muted-foreground">mg/dL</span></span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border">
                                        <span className="text-foreground font-bold">Albumin</span>
                                        <span className="text-primary font-extrabold">{report.albumin} <span className="text-sm font-normal text-muted-foreground">g/dL</span></span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border">
                                        <span className="text-foreground font-bold">SGPT (ALT)</span>
                                        <span className="text-primary font-extrabold">{report.sgpt} <span className="text-sm font-normal text-muted-foreground">U/L</span></span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-foreground font-bold">SGOT (AST)</span>
                                        <span className="text-primary font-extrabold">{report.sgot} <span className="text-sm font-normal text-muted-foreground">U/L</span></span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                    AI Medical Synthesis
                                </h3>
                                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 text-primary leading-relaxed max-h-96 overflow-y-auto shadow-inner">
                                    {report.ai_summary ? (
                                        <div className="prose prose-sm prose-blue max-w-none">
                                            <ReactMarkdown>{report.ai_summary}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-primary/70 italic text-sm font-medium">No AI summary generated for this report.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-border pt-8 no-print">
                            <PrescriptionManager
                                reportId={report.id}
                                role={user.role as string}
                                doctorName={doctor?.full_name || 'Hepatology Specialist'}
                                initialPrescription={prescription || null}
                            />
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
