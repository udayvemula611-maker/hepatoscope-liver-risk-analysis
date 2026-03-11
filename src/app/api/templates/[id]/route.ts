import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

const templateSchema = z.object({
    hospital_name: z.string().min(2, "Hospital name is required"),
    logo_url: z.string().url("Must be a valid URL").or(z.literal('')).nullable().optional(),
    primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid HEX color code (e.g. #1E3A8A)"),
    disclaimer_text: z.string().nullable().optional(),
    is_active: z.boolean().default(false)
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await request.json();
        const result = templateSchema.safeParse(body);

        if (!result.success) {
            console.error("Template validation error:", result.error.issues);
            return NextResponse.json({ error: 'Invalid template data provided.' }, { status: 400 });
        }

        const data = result.data;

        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        if (data.is_active) {
            await supabaseAdmin.from('report_templates').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
        }

        const { error: updateError } = await supabaseAdmin.from('report_templates').update({
            hospital_name: data.hospital_name,
            logo_url: data.logo_url && data.logo_url !== '' ? data.logo_url : null,
            primary_color: data.primary_color,
            disclaimer_text: data.disclaimer_text || null,
            is_active: data.is_active
        }).eq('id', id);

        if (updateError) {
            console.error('Failed to update template:', updateError);
            return NextResponse.json({ error: 'Failed to update template.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Template updated successfully.' }, { status: 200 });
    } catch (error: any) {
        console.error('API Error updating template:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error: deleteError } = await supabaseAdmin.from('report_templates').delete().eq('id', id);

        if (deleteError) {
            console.error('Failed to delete template:', deleteError);
            return NextResponse.json({ error: 'Failed to delete template.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Template deleted successfully.' }, { status: 200 });
    } catch (error: any) {
        console.error('API Error deleting template:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
