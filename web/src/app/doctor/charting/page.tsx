'use client';

import Link from 'next/link';
import ChartingDashboard from '@/components/ChartingDashboard';

export default function VoiceChartingPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8 print:py-2 print:bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <Link href="/doctor" className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors mb-2 inline-flex items-center gap-1">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              Voice Operatory
            </h1>
            <p className="text-slate-500 font-medium mt-1 text-sm">Real-time AI-assisted clinical charting.</p>
          </div>
        </div>

        {/* The existing Charting Dashboard */}
        <ChartingDashboard />

      </div>
    </main>
  );
}
