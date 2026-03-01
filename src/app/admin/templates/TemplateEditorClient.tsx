'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Setup Zod schema for Template inputs
const templateSchema = z.object({
    hospital_name: z.string().min(2, "Hospital name is required"),
    logo_url: z.string().url("Must be a valid URL").or(z.literal('')),
    primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid HEX color code (e.g. #1E3A8A)"),
    disclaimer_text: z.string().optional(),
    is_active: z.boolean().default(false)
});

type TemplateData = z.infer<typeof templateSchema>;

export default function TemplateEditorClient({ templates = [] }: { templates: any[] }) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<TemplateData>({
        resolver: zodResolver(templateSchema) as any,
        defaultValues: {
            primary_color: '#1E3A8A',
            is_active: false
        }
    });

    const primaryColorWatch = watch('primary_color');

    // UI Togglers
    const toggleCreateModal = () => {
        setIsCreating(!isCreating);
        if (!isCreating) reset();
    };

    const onSubmit = async (data: TemplateData) => {
        setLoading(true);

        try {
            const res = await fetch('/api/templates/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to save template');
            }

            toast.success("Template Saved Successfully");
            toggleCreateModal();
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Available Templates</h2>
                <button
                    onClick={toggleCreateModal}
                    className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#152b66] transition-colors"
                >
                    <Plus className="w-4 h-4" /> Create Template
                </button>
            </div>

            {/* Template List */}
            {templates.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500 font-medium">No templates configured yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((tpl) => (
                        <div key={tpl.id} className={`bg-white rounded-xl border p-6 transition-all ${tpl.is_active ? 'border-green-500 shadow-sm ring-1 ring-green-500' : 'border-gray-200 hover:border-blue-300'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{tpl.hospital_name}</h3>
                                    {tpl.is_active && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md mt-2">
                                            <CheckCircle2 className="w-3 h-3" /> ACTIVE TEMPLATE
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2 text-gray-400">
                                    <button className="hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                    <button className="hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-500 w-24">Theme Color:</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: tpl.primary_color }}></div>
                                        <span className="font-mono text-gray-700">{tpl.primary_color}</span>
                                    </div>
                                </div>
                                {tpl.logo_url && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-gray-500 w-24">Logo:</span>
                                        <span className="text-blue-600 text-xs truncate max-w-[120px]">{tpl.logo_url}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Create New Template</h3>
                            <button onClick={toggleCreateModal} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital / Clinic Name</label>
                                    <input
                                        {...register('hospital_name')}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                                        placeholder="e.g. General Hospital"
                                    />
                                    {errors.hospital_name && <p className="text-red-500 text-xs mt-1">{errors.hospital_name.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Brand HEX Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={primaryColorWatch || '#1E3A8A'}
                                                onChange={(e) => setValue('primary_color', e.target.value)}
                                                className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
                                            />
                                            <input
                                                {...register('primary_color')}
                                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 font-mono focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                                                placeholder="#1E3A8A"
                                            />
                                        </div>
                                        {errors.primary_color && <p className="text-red-500 text-xs mt-1">{errors.primary_color.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Logo URL (Optional)</label>
                                        <input
                                            {...register('logo_url')}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                                            placeholder="https://example.com/logo.png"
                                        />
                                        {errors.logo_url && <p className="text-red-500 text-xs mt-1">{errors.logo_url.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Report Disclaimer Footer</label>
                                    <textarea
                                        {...register('disclaimer_text')}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                                        placeholder="This is an AI-assisted report and does not substitute professional medical advice."
                                    />
                                </div>

                                <div className="flex items-center gap-3 bg-gray-50 p-4 border border-gray-200 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        {...register('is_active')}
                                        className="w-5 h-5 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-semibold text-gray-800 cursor-pointer">
                                        Set as Active Template
                                        <span className="block text-xs font-normal text-gray-500 mt-0.5">This will override any currently active template used for PDF generation.</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={toggleCreateModal}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 text-sm flex items-center gap-2 font-bold text-white bg-[#1E3A8A] hover:bg-[#152b66] disabled:opacity-70 rounded-lg transition-colors"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Save Template
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
