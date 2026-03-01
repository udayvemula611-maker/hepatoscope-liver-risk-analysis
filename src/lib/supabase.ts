import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This is the client for use in browser/client components and automatically manages cookies for SSR
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
