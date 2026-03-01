import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';

export default async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-[#1E3A8A] rounded-md flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-bold">H</span>
                    </div>
                    <span className="font-bold sm:inline-block text-xl text-[#1E3A8A] tracking-tight">
                        HepatoScope
                    </span>
                </Link>

                <div className="flex items-center space-x-4 text-sm font-medium">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold bg-blue-50 text-[#1E3A8A] px-3 py-1 rounded-full border border-blue-100">Portal Access</span>
                            <form action="/auth/signout" method="post">
                                <button className="text-gray-500 hover:text-red-600 transition-colors font-semibold">
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="bg-[#1E3A8A] text-white px-5 py-2 rounded-lg hover:bg-[#152b66] transition-colors shadow-sm font-medium">
                                Provider & Patient Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
