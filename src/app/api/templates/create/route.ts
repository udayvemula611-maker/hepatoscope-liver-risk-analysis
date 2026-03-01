import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

const templateSchema = z.object({
    hospital_name: z.string().min(2),
    logo_url: z.string().optional(),
    primary_color: z.string(),
    disclaimer_text: z.string().optional(),
    is_active: z.boolean().default(false)
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = templateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid template data provided.' }, { status: 400 });
        }

        const data = result.data;

        // Use Admin client to insert into the strictly protected report_templates table
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // If 'is_active' is true, we must deactivate all other templates first to maintain integrity
        if (data.is_active) {
            await supabaseAdmin.from('report_templates').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
        }

        const { error: insertError } = await supabaseAdmin.from('report_templates').insert({
            hospital_name: data.hospital_name,
            logo_url: data.logo_url && data.logo_url !== '' ? data.logo_url : null,
            primary_color: data.primary_color,
            disclaimer_text: data.disclaimer_text || null,
            is_active: data.is_active
        });

        if (insertError) {
            console.error(insertError);
            return NextResponse.json({ error: 'Failed to insert template into database.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Template saved successfully.' }, { status: 201 });

    } catch (error: any) {
        console.error('API Error saving template:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
