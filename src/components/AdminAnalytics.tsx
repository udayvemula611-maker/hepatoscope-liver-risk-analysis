'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const RISK_COLORS = {
    'High': '#DC2626',
    'Moderate': '#F59E0B',
    'Low': '#16A34A',
    'Unknown': '#9CA3AF' // Fallback
};

export default function AdminAnalytics({ reports, users }: { reports: any[], users: any[] }) {

    // Calculate Risk Distribution
    const riskCounts = reports.reduce((acc, report) => {
        const risk = report.risk_level || 'Unknown';
        acc[risk] = (acc[risk] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(riskCounts).map(key => ({
        name: key,
        value: riskCounts[key]
    }));

    // Calculate Doctor Load (Top 5)
    const doctorCounts = reports.reduce((acc, report) => {
        if (!report.doctor_id) return acc;
        acc[report.doctor_id] = (acc[report.doctor_id] || 0) + 1;
        return acc;
    }, {});

    const barData = Object.keys(doctorCounts).map(docId => {
        const doc = users.find(u => u.id === docId);
        return {
            name: doc ? doc.full_name : 'Unknown Dr.',
            Reports: doctorCounts[docId]
        };
    }).sort((a, b) => b.Reports - a.Reports).slice(0, 5);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Risk Distribution Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-primary">Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        {reports.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">No reports available</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS] || RISK_COLORS['Unknown']} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Doctor Workload Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-primary">Top Providers by Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        {reports.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">No reports available</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="Reports" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
