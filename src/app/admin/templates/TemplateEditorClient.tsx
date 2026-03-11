'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Zod schema for validating template inputs. Each field defines its type, validation rules, and error messages.
const templateSchema = z.object({
    hospital_name: z.string().min(2, "Hospital name is required"), // Hospital name must be at least 2 characters.
    logo_url: z.string().url("Must be a valid URL").or(z.literal('')), // Optional logo URL, must be a valid URL if provided.
    primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid HEX color code (e.g. #1E3A8A)"), // Primary color must be a valid HEX code.
    disclaimer_text: z.string().optional(), // Optional disclaimer text.
    is_active: z.boolean().default(false) // Boolean indicating if the template is active, defaults to false.
});

// Type definition for template data, inferred from the Zod schema.
type TemplateData = z.infer<typeof templateSchema>;

/**
 * TemplateEditorClient Component
 *
 * This client-side component provides an interface for administrators to manage
 * hospital report templates. It allows for creating new templates, and eventually
 * editing and deleting existing ones (though edit/delete functionality is not fully implemented).
 * It uses `react-hook-form` for form management and `zod` for validation.
 *
 * @param {object} props - The properties for the component.
 * @param {any[]} props.templates - An array of existing report template objects.
 * @returns {JSX.Element} The rendered template editor interface.
 */
export default function TemplateEditorClient({ templates = [] }: { templates: any[] }) {
    const router = useRouter(); // Next.js router for refreshing data.
    const [isCreating, setIsCreating] = useState(false); // State to control the visibility of the "Create Template" modal.
    const [loading, setLoading] = useState(false); // State to manage loading status during form submissions.
    const [editingId, setEditingId] = useState<string | null>(null); // Track the template being edited

    // Initializes react-hook-form with Zod resolver for schema validation.
    const {
        register, // Function to register inputs with React Hook Form.
        handleSubmit, // Function to handle form submission, including validation.
        reset, // Function to reset the form fields to their default values.
        watch, // Function to subscribe to and watch input values for real-time updates.
        setValue, // Function to programmatically set input values.
        formState: { errors } // Object containing form validation errors.
    } = useForm<TemplateData>({
        resolver: zodResolver(templateSchema) as any, // Integrates Zod schema for validation rules.
        defaultValues: { // Sets initial default values for form fields.
            primary_color: '#1E3A8A', // Default primary color.
            is_active: false // Default active status.
        }
    });

    // Watches the `primary_color` field to provide a live preview.
    const primaryColorWatch = watch('primary_color');

    /**
     * Toggles the visibility of the "Create Template" modal.
     * Resets the form fields when opening the modal for creation.
     */
    const toggleCreateModal = () => {
        setIsCreating(!isCreating);
        if (!isCreating) {
            reset({ primary_color: '#1E3A8A', is_active: false }); // Reset form when opening to create a new template.
            setEditingId(null);
        } else {
            setEditingId(null);
        }
    };

    /**
     * Handles the form submission for creating a new template.
     * @param {TemplateData} data - The validated form data for the new template.
     */
    const onSubmit = async (data: TemplateData) => {
        setLoading(true); // Set loading state to true.

        try {
            // Determine API URL and method based on whether we are creating or updating
            const url = editingId ? `/api/templates/${editingId}` : '/api/templates/create';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data), // Send form data as JSON.
            });

            if (!res.ok) {
                // If the response is not successful, parse and throw an error.
                const errorData = await res.json();
                throw new Error(errorData.error || `Failed to ${editingId ? 'update' : 'save'} template`);
            }

            toast.success(`Template ${editingId ? 'Updated' : 'Saved'} Successfully`); // Display success notification.
            setIsCreating(false); // Close the modal.
            setEditingId(null);
            router.refresh(); // Refresh the router to update the list of templates.
        } catch (err: any) {
            toast.error(err.message); // Display error notification.
        } finally {
            setLoading(false); // Reset loading state.
        }
    };

    /**
     * Handles opening the modal in edit mode.
     */
    const handleEdit = (tpl: any) => {
        setValue('hospital_name', tpl.hospital_name || '');
        setValue('logo_url', tpl.logo_url || '');
        setValue('primary_color', tpl.primary_color || '#1E3A8A');
        setValue('disclaimer_text', tpl.disclaimer_text || '');
        setValue('is_active', tpl.is_active || false);
        setEditingId(tpl.id);
        setIsCreating(true);
    };

    /**
     * Handles deleting a template.
     */
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete template');
            }
            toast.success('Template deleted successfully');
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header Actions: Displays "Available Templates" title and "Create Template" button. */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Available Templates</h2>
                <button
                    onClick={toggleCreateModal} // Opens the create template modal.
                    className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#152b66] transition-colors"
                >
                    <Plus className="w-4 h-4" /> Create Template
                </button>
            </div>

            {/* Template List: Displays existing templates or a message if none are configured. */}
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
                                    {/* Displays an "ACTIVE TEMPLATE" badge if the template is active. */}
                                    {tpl.is_active && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md mt-2">
                                            <CheckCircle2 className="w-3 h-3" /> ACTIVE TEMPLATE
                                        </span>
                                    )}
                                </div>
                                {/* Action buttons for editing and deleting templates. */}
                                <div className="flex gap-2 text-gray-400">
                                    <button onClick={() => handleEdit(tpl)} className="hover:text-blue-600 transition-colors" title="Edit Template"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(tpl.id)} className="hover:text-red-600 transition-colors" title="Delete Template"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Template Details: Theme color and logo URL. */}
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

            {/* Create Template Modal: Conditionally rendered when `isCreating` is true. */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Template' : 'Create New Template'}</h3>
                            <button onClick={toggleCreateModal} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
                        </div>

                        {/* Template Creation Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                            <div className="space-y-5">
                                {/* Hospital Name Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital / Clinic Name</label>
                                    <input
                                        {...register('hospital_name')}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                                        placeholder="e.g. General Hospital"
                                    />
                                    {errors.hospital_name && <p className="text-red-500 text-xs mt-1">{errors.hospital_name.message}</p>}
                                </div>

                                {/* Brand Color and Logo URL Inputs */}
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

                                {/* Report Disclaimer Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Report Disclaimer Footer</label>
                                    <textarea
                                        {...register('disclaimer_text')}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                                        placeholder="This is an AI-assisted report and does not substitute professional medical advice."
                                    />
                                </div>

                                {/* Active Template Checkbox */}
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

                            {/* Form Action Buttons */}
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
                                    {editingId ? 'Update Template' : 'Save Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
