import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    full_name: z.string().min(2, 'Full name is required'),
    role: z.enum(['doctor', 'patient']),
    age: z.string().optional(),
    gender: z.string().optional(),
    assigned_doctor: z.string().optional().nullable()
});

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const reqCookies = await cookieStore;

        // 1. Verify the requester is an Admin using standard client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return reqCookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                reqCookies.set(name, value, options)
                            );
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // We must check if the current user is an admin bypassing RLS
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [], setAll: () => { } } }
        );

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        // 2. Validate new user data
        const body = await request.json();
        const result = createUserSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0]?.message || 'Validation failed' }, { status: 400 });
        }

        const { email, password, full_name, role, age, gender, assigned_doctor } = result.data;

        // 3. Create the new user using the Admin client so it doesn't log the admin out
        // adminAuth.createUser bypasses email confirmation if configured in Supabase
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: full_name,
                role: role,
                age: age ? parseInt(age) : null,
                gender: gender || null
            }
        });

        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 400 });
        }

        // 4. Update additional profile fields since the auth trigger doesn't copy age/gender
        if (newUser.user) {
            const updatePayload: any = {};
            if (age) updatePayload.age = parseInt(age);
            if (gender) updatePayload.gender = gender;
            if (role === 'patient' && assigned_doctor) {
                updatePayload.assigned_doctor = assigned_doctor;
            }

            if (Object.keys(updatePayload).length > 0) {
                await supabaseAdmin
                    .from('profiles')
                    .update(updatePayload)
                    .eq('id', newUser.user.id);
            }
        }

        return NextResponse.json({
            message: `Successfully created ${role} account for ${full_name}`,
            user: {
                id: newUser.user.id,
                email: newUser.user.email,
                role: role
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
