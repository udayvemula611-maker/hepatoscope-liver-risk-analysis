import Navbar from "@/components/Navbar";

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50/50 to-slate-100/50 pointer-events-none" />
            <div className="z-10 flex flex-col items-center gap-6">
                <div className="relative flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-75"></div>
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-200">
                        <svg className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-blue-900">HepatoScope</h2>
                    <p className="mt-1 text-sm font-medium text-slate-500 animate-pulse">Initializing Medical Environment...</p>
                </div>
            </div>
        </div>
    );
}
