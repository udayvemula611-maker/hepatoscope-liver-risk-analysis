import Link from 'next/link';
import RiskBadge from './RiskBadge';
import { LiverReport } from '@/types/report';

export default function ReportCard({ report }: { report: LiverReport }) {
    const date = new Date(report.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <Link href={`/doctor/reports/${report.id}`} className="block group">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow bg-white h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-[#1E3A8A] group-hover:text-[#3B82F6] transition-colors leading-tight">
                                {report.patient_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {report.age}yo {report.gender} • {date}
                            </p>
                        </div>
                        <RiskBadge level={report.risk_level} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mt-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Bilirubin</p>
                            <p className="font-bold text-[#1E3A8A]">{report.total_bilirubin} <span className="text-xs font-normal text-gray-500">mg/dL</span></p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Albumin</p>
                            <p className="font-bold text-[#1E3A8A]">{report.albumin} <span className="text-xs font-normal text-gray-500">g/dL</span></p>
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-[#3B82F6] group-hover:text-[#1E3A8A] font-semibold transition-colors text-sm">
                        View Full Report
                        <span className="text-lg leading-none transition-transform group-hover:translate-x-1">&rarr;</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
