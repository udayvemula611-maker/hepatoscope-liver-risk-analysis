import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname;

    // Protect protected routes
    const isProtectedRoute = path.startsWith('/admin') || path.startsWith('/doctor') || path.startsWith('/patient') || path.startsWith('/api/analyze') || path.startsWith('/api/reports') || path.startsWith('/api/users');

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based protection
    if (isProtectedRoute && user) {
        // Create an admin client to bypass RLS and guarantee we get the role
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => request.cookies.getAll(), setAll: () => { } } }
        )

        // Fetch user role
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error("Middleware profile fetch error:", profileError, "for user:", user.id);
        }

        const role = profile?.role || 'patient';

        if (path.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }

        if (path.startsWith('/doctor') && role !== 'doctor' && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }

        // Patient route is isolated to patients (and maybe admins)
        if (path.startsWith('/patient') && role !== 'patient' && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }
    }

    // Redirect signed-in users away from auth pages
    if (user && (path.startsWith('/login') || path.startsWith('/register'))) {
        // Create an admin client to bypass RLS and guarantee we get the role
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => request.cookies.getAll(), setAll: () => { } } }
        )

        // Determine where to redirect based on role
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error("Middleware profile fetch error (auth pages redirect):", profileError, "for user:", user.id);
        }

        const role = profile?.role || 'patient';
        if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
        if (role === 'doctor') return NextResponse.redirect(new URL('/doctor', request.url))
        if (role === 'patient') return NextResponse.redirect(new URL('/patient', request.url))

        return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
