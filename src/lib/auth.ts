import { createClient } from './supabaseServer'

export async function getUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    // Fetch the role from the profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    return {
        ...user,
        role: profile?.role || 'patient',
        full_name: profile?.full_name || ''
    }
}

export async function checkRole(allowedRoles: string[]) {
    const user = await getUser()
    if (!user || !allowedRoles.includes(user.role)) {
        return false
    }
    return user
}
