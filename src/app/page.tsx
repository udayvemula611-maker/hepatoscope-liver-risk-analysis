import Link from 'next/link';
import { ShieldCheck, Activity, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#F9FAFB] relative overflow-hidden">

      <div className="relative z-10 text-center space-y-10 max-w-5xl px-4 py-16">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-[#1E3A8A] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-4xl font-bold">H</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight">
          AI-Assisted <br className="hidden md:block" />
          <span className="text-[#3B82F6]">Liver Health</span> Assessment
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          HepatoScope empowers healthcare professionals and patients with rapid, secure, and intelligent liver function test evaluations.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl bg-[#1E3A8A] text-white font-medium hover:bg-[#152b66] transition-all shadow-md hover:shadow-lg flex items-center justify-center text-lg w-full sm:w-auto"
          >
            Access Platform
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto text-left">
          <div className="flex flex-col items-center sm:items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <Activity className="h-10 w-10 text-[#3B82F6] mb-4" />
            <h3 className="font-bold text-gray-900 text-lg">Clinical Risk Evaluation</h3>
            <p className="text-gray-500 mt-2 text-center sm:text-left text-sm">Rule-based scoring maps LFT values strictly to medical risk levels.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <ShieldCheck className="h-10 w-10 text-[#3B82F6] mb-4" />
            <h3 className="font-bold text-gray-900 text-lg">AI Medical Explanation</h3>
            <p className="text-gray-500 mt-2 text-center sm:text-left text-sm">Generates plain-language medical context to help patients understand results.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <Database className="h-10 w-10 text-[#3B82F6] mb-4" />
            <h3 className="font-bold text-gray-900 text-lg">Secure Cloud Storage</h3>
            <p className="text-gray-500 mt-2 text-center sm:text-left text-sm">Healthcare-grade Row-Level Security ensures data is isolated and protected.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
