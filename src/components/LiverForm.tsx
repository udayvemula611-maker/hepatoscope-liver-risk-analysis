'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Activity, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile } from '@/types/user';
import { calculateRisk } from '@/lib/riskEngine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as motion from 'framer-motion/client';

const formSchema = z.object({
    patient_id: z.string().min(1, "Please select a registered patient"),
    total_bilirubin: z.coerce.number().min(0).step(0.1),
    sgpt: z.coerce.number().min(0),
    sgot: z.coerce.number().min(0),
    albumin: z.coerce.number().min(0).step(0.1),
});

type FormData = z.infer<typeof formSchema>;

export default function LiverForm({ patients = [] }: { patients?: UserProfile[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            patient_id: '',
        }
    });

    const formValues = watch(); // Live track all inputs

    // Calculate deterministic risk safely assuming partial data might be present
    const liveRisk = calculateRisk({
        patient_name: '', // Not needed for calculation
        ...formValues,
        total_bilirubin: Number(formValues.total_bilirubin) || 0,
        sgpt: Number(formValues.sgpt) || 0,
        sgot: Number(formValues.sgot) || 0,
        albumin: Number(formValues.albumin) || 0,
    } as any);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError('');

        // Provide the correct patient_name for the backend to use
        const selectedPatient = patients.find(p => p.id === data.patient_id);
        const payload = {
            ...data,
            patient_name: selectedPatient ? selectedPatient.full_name : 'Unknown Patient'
        };

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to submit report');
            }

            toast.success('Analysis completed successfully!');
            router.push(`/doctor/reports/${result.reportId}`);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
            {/* Left Panel: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-md">
                    <CardHeader className="bg-primary/5 border-b pb-6">
                        <CardTitle className="text-2xl font-extrabold text-primary">Clinical Variables</CardTitle>
                        <CardDescription>Enter patient lab values to calculate risk and generate an AI-assisted report.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form id="liver-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            {/* Patient Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-foreground">Registered Patient Profile</label>
                                <select
                                    {...register('patient_id')}
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-white text-foreground"
                                >
                                    <option value="">-- Select Patient --</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.full_name || 'Anonymous'}</option>
                                    ))}
                                </select>
                                {errors.patient_id && <p className="text-destructive text-xs font-medium">{errors.patient_id.message}</p>}
                            </div>

                            <div className="pt-4 border-t border-border">
                                <h3 className="text-lg font-bold text-primary mb-4">Liver Function Test (LFT) Results</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-foreground">Total Bilirubin</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                {...register('total_bilirubin')}
                                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors pr-16 bg-white"
                                                placeholder="1.0"
                                            />
                                            <span className="absolute right-4 top-3.5 text-muted-foreground text-sm font-medium">mg/dL</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium flex justify-between">
                                            <span>Reference: 0.1 - 1.2</span>
                                            {errors.total_bilirubin && <span className="text-destructive text-right">{errors.total_bilirubin.message}</span>}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-foreground">Albumin</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                {...register('albumin')}
                                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors pr-16 bg-white"
                                                placeholder="4.0"
                                            />
                                            <span className="absolute right-4 top-3.5 text-muted-foreground text-sm font-medium">g/dL</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium flex justify-between">
                                            <span>Reference: 3.4 - 5.4</span>
                                            {errors.albumin && <span className="text-destructive text-right">{errors.albumin.message}</span>}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-foreground">SGPT / ALT</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                {...register('sgpt')}
                                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors pr-12 bg-white"
                                                placeholder="30"
                                            />
                                            <span className="absolute right-4 top-3.5 text-muted-foreground text-sm font-medium">U/L</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium flex justify-between">
                                            <span>Reference: 7 - 56</span>
                                            {errors.sgpt && <span className="text-destructive text-right">{errors.sgpt.message}</span>}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-foreground">SGOT / AST</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                {...register('sgot')}
                                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors pr-12 bg-white"
                                                placeholder="25"
                                            />
                                            <span className="absolute right-4 top-3.5 text-muted-foreground text-sm font-medium">U/L</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium flex justify-between">
                                            <span>Reference: 8 - 48</span>
                                            {errors.sgot && <span className="text-destructive text-right">{errors.sgot.message}</span>}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Right Panel: Live Risk & Action */}
            <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                    <Card className={`border-2 transition-colors duration-500 shadow-md ${liveRisk.level === 'High' ? 'border-destructive/50 bg-destructive/5' :
                            liveRisk.level === 'Moderate' ? 'border-amber-500/50 bg-amber-500/5' :
                                liveRisk.level === 'Low' ? 'border-green-500/50 bg-green-500/5' :
                                    'border-border'
                        }`}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex justify-between items-center">
                                <span>Risk Preview</span>
                                {liveRisk.level === 'High' && <AlertCircle className="w-5 h-5 text-destructive animate-pulse" />}
                                {liveRisk.level === 'Moderate' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                {liveRisk.level === 'Low' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {liveRisk.level === 'Unknown' && <Activity className="w-5 h-5 text-muted-foreground" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <motion.div
                                    key={liveRisk.level}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 shadow-inner ${liveRisk.level === 'High' ? 'bg-destructive text-destructive-foreground' :
                                            liveRisk.level === 'Moderate' ? 'bg-amber-500 text-white' :
                                                liveRisk.level === 'Low' ? 'bg-green-600 text-white' :
                                                    'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    <span className="text-3xl font-black tracking-tighter uppercase">{liveRisk.level}</span>
                                </motion.div>
                                <p className="text-sm text-foreground font-medium px-4">
                                    {liveRisk.level === 'Unknown' ? 'Enter values to see risk estimation.' :
                                        liveRisk.level === 'High' ? 'Critical condition detected. Immediate attention recommended.' :
                                            liveRisk.level === 'Moderate' ? 'Elevated values observed. Monitor closely.' :
                                                'Values appear within nominal ranges.'}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-border border-dashed">
                                <button
                                    type="submit"
                                    form="liver-form"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-lg text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                            Analyzing via AI...
                                        </>
                                    ) : (
                                        'Generate AI Synthesized Report'
                                    )}
                                </button>
                                {error && <p className="text-destructive text-xs mt-3 text-center">{error}</p>}
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
