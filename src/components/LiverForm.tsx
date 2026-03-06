'use client';

import { useState, useEffect } from 'react';
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
    age: z.coerce.number().min(1),
    gender: z.string().min(1),
    total_bilirubin: z.coerce.number().min(0).step(0.1),
    sgpt: z.coerce.number().min(0),
    sgot: z.coerce.number().min(0),
    albumin: z.coerce.number().min(0).step(0.1),
    alk_phosphate: z.coerce.number().min(0).optional(),
    protime: z.coerce.number().min(0).optional(),
    fatigue: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
    spiders: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
    ascites: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
    varices: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
    steroid: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
    antivirals: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
    histology: z.string().default('None'),
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
        setValue,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            patient_id: '',
            age: 0,
            gender: '',
            fatigue: false,
            spiders: false,
            ascites: false,
            varices: false,
            steroid: false,
            antivirals: false,
            histology: 'None',
        }
    });

    const selectedPatientId = watch('patient_id');

    // Auto-fill Age and Gender when patient is selected
    useEffect(() => {
        const selectedPatient = patients.find(p => p.id === selectedPatientId);
        if (selectedPatient) {
            if (selectedPatient.age) setValue('age', selectedPatient.age);
            if (selectedPatient.gender) setValue('gender', selectedPatient.gender);
        }
    }, [selectedPatientId, patients, setValue]);

    const formValues = watch(); // Live track all inputs

    // Calculate deterministic risk safely assuming partial data might be present
    const liveRisk = calculateRisk({
        patient_name: '',
        ...formValues,
        total_bilirubin: Number(formValues.total_bilirubin) || 0,
        sgpt: Number(formValues.sgpt) || 0,
        sgot: Number(formValues.sgot) || 0,
        albumin: Number(formValues.albumin) || 0,
        alk_phosphate: Number(formValues.alk_phosphate) || 0,
        protime: Number(formValues.protime) || 0,
        age: Number(formValues.age) || 0,
        gender: formValues.gender || 'Unknown',
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

        console.log("LiverForm: Submitting Data", payload);

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            console.log("LiverForm: API Response", result);

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

    const onError = (errors: any) => {
        console.error("LiverForm Validation Errors:", errors);
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
                        <form id="liver-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-foreground">Age</label>
                                    <input
                                        type="number"
                                        {...register('age')}
                                        readOnly={!!selectedPatientId}
                                        className={`w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors ${selectedPatientId ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white'}`}
                                        placeholder="7"
                                    />
                                    {errors.age && <p className="text-destructive text-xs font-medium">{errors.age.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-foreground">Gender</label>
                                    <div className={`flex space-x-4 pt-2 p-1 rounded ${selectedPatientId ? 'bg-gray-50' : ''}`}>
                                        <label className={`flex items-center space-x-2 ${selectedPatientId ? 'cursor-not-allowed' : ''}`}>
                                            <input type="radio" value="Male" {...register('gender')} className={`text-primary focus:ring-primary h-4 w-4 ${selectedPatientId ? 'pointer-events-none opacity-50' : ''}`} />
                                            <span className={`text-sm ${selectedPatientId ? 'text-muted-foreground' : ''}`}>Male</span>
                                        </label>
                                        <label className={`flex items-center space-x-2 ${selectedPatientId ? 'cursor-not-allowed' : ''}`}>
                                            <input type="radio" value="Female" {...register('gender')} className={`text-primary focus:ring-primary h-4 w-4 ${selectedPatientId ? 'pointer-events-none opacity-50' : ''}`} />
                                            <span className={`text-sm ${selectedPatientId ? 'text-muted-foreground' : ''}`}>Female</span>
                                        </label>
                                    </div>
                                    {errors.gender && <p className="text-destructive text-xs font-medium">{errors.gender.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-foreground">Have you Addicted to Steroids?</label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" value="false" {...register('steroid')} defaultChecked className="text-primary focus:ring-primary h-4 w-4" />
                                            <span className="text-sm">No</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" value="true" {...register('steroid')} className="text-primary focus:ring-primary h-4 w-4" />
                                            <span className="text-sm">Yes</span>
                                        </label>
                                    </div>
                                    {errors.steroid && <p className="text-destructive text-xs font-medium">{errors.steroid.message as string}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-foreground">Have you Addicted to Antivirals?</label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" value="false" {...register('antivirals')} defaultChecked className="text-primary focus:ring-primary h-4 w-4" />
                                            <span className="text-sm">No</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" value="true" {...register('antivirals')} className="text-primary focus:ring-primary h-4 w-4" />
                                            <span className="text-sm">Yes</span>
                                        </label>
                                    </div>
                                    {errors.antivirals && <p className="text-destructive text-xs font-medium">{errors.antivirals.message as string}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-foreground">Are You Fatigued?</label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" value="false" {...register('fatigue')} defaultChecked className="text-primary focus:ring-primary h-4 w-4" />
                                            <span className="text-sm">No</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" value="true" {...register('fatigue')} className="text-primary focus:ring-primary h-4 w-4" />
                                            <span className="text-sm">Yes</span>
                                        </label>
                                    </div>
                                    {errors.fatigue && <p className="text-destructive text-xs font-medium">{errors.fatigue.message as string}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-foreground">Presence of Spider Naevi</label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" value="false" {...register('spiders')} defaultChecked className="text-primary focus:ring-primary h-4 w-4" />
                                            <span className="text-sm">No</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" value="true" {...register('spiders')} className="text-primary focus:ring-primary h-4 w-4" />
                                            <span className="text-sm">Yes</span>
                                        </label>
                                    </div>
                                    {errors.spiders && <p className="text-destructive text-xs font-medium">{errors.spiders.message as string}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-foreground">Presence of Varices</label>
                                    <select
                                        {...register('varices')}
                                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-white"
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                    {errors.varices && <p className="text-destructive text-xs font-medium">{errors.varices.message as string}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-foreground">Presence of Ascites</label>
                                    <select
                                        {...register('ascites')}
                                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-white"
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                    {errors.ascites && <p className="text-destructive text-xs font-medium">{errors.ascites.message as string}</p>}
                                </div>
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

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-foreground">Alk Phostate</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                {...register('alk_phosphate')}
                                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors pr-12 bg-white"
                                                placeholder="100"
                                            />
                                            <span className="absolute right-4 top-3.5 text-muted-foreground text-sm font-medium">U/L</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium flex justify-between">
                                            <span>Reference: 44 - 147</span>
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-foreground">Protime</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                {...register('protime')}
                                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors pr-12 bg-white"
                                                placeholder="12"
                                            />
                                            <span className="absolute right-4 top-3.5 text-muted-foreground text-sm font-medium">sec</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium flex justify-between">
                                            <span>Reference: 11 - 13.5</span>
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-foreground">Histology</label>
                                        <select
                                            {...register('histology')}
                                            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-white"
                                        >
                                            <option value="None">No</option>
                                            <option value="F0">F0 - Normal</option>
                                            <option value="F1">F1 - Mild Fibrosis</option>
                                            <option value="F2">F2 - Moderate Fibrosis</option>
                                            <option value="F3">F3 - Severe Fibrosis</option>
                                            <option value="F4">F4 - Cirrhosis</option>
                                        </select>
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
