'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function PrescriptionManager({
    reportId,
    role,
    doctorName,
    initialPrescription
}: {
    reportId: string;
    role: string;
    doctorName: string;
    initialPrescription: any | null
}) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        prescription_text: '',
        follow_up_date: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_id: reportId,
                    prescription_text: formData.prescription_text,
                    follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : null
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success("Prescription saved successfully!");
            router.refresh(); // Refresh the server component to load the saved prescription
        } catch (error: any) {
            toast.error(error.message || "Failed to save prescription");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (initialPrescription) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 mt-8 font-sans overflow-hidden">
                <div className="bg-[#1E3A8A] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg tracking-wide">Doctor Prescription</h3>
                    <span className="text-sm rounded-full bg-blue-800 px-3 py-1 font-medium">{new Date(initialPrescription.created_at).toLocaleDateString()}</span>
                </div>

                <div className="p-8 pb-12 relative bg-[#F8FAFC]">
                    {/* Medical Header */}
                    <div className="flex justify-between items-end border-b-2 border-dashed border-gray-300 pb-4 mb-6">
                        <div>
                            <h4 className="text-2xl font-bold text-gray-900 leading-tight">{doctorName}</h4>
                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mt-1">Hepatology Specialist</p>
                        </div>
                        <p className="text-gray-500 font-medium font-mono">Rx</p>
                    </div>

                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-medium min-h-[150px]">
                        {initialPrescription.prescription_text}
                    </div>

                    {initialPrescription.follow_up_date && (
                        <div className="mt-8 pt-4 border-t border-gray-200 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-bold text-gray-700">Follow-up Recommended:</span>
                            <span className="text-[#1E3A8A] font-semibold">{new Date(initialPrescription.follow_up_date).toLocaleDateString()}</span>
                        </div>
                    )}

                    <div className="mt-16 pt-6 border-t-2 border-dashed border-gray-300 flex justify-end">
                        <div className="text-center w-48">
                            <div className="h-4 border-b border-gray-400 mb-2"></div>
                            <p className="text-sm text-gray-500 font-medium">Doctor Signature</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (role === 'doctor') {
        if (!isAdding) {
            return (
                <div className="mt-8">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-4 bg-white border-2 border-dashed border-blue-200 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                        + Add Medical Prescription
                    </button>
                </div>
            );
        }

        return (
            <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative">
                <button
                    onClick={() => setIsAdding(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
                >×</button>
                <h3 className="font-bold text-xl text-[#1E3A8A] mb-4">Write Prescription</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Medication & Diet Advice</label>
                        <textarea
                            required
                            rows={8}
                            value={formData.prescription_text}
                            onChange={(e) => setFormData({ ...formData, prescription_text: e.target.value })}
                            className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none"
                            placeholder="Example:&#10;• Tab XYZ 1-0-1&#10;• Syrup ABC 10ml twice daily&#10;&#10;Diet Advice:&#10;Avoid oily foods and alcohol."
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Follow-up Date (Optional)</label>
                        <input
                            type="date"
                            value={formData.follow_up_date}
                            onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#1E3A8A] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#152b66] transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            {isSubmitting ? 'Saving...' : 'Save Prescription'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return null; // Patient looking at unprescribed report gets nothing.
}
