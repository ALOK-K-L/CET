'use client';

import Link from 'next/link';
import Odontogram from 'react-advanced-odontogram';
import 'react-advanced-odontogram/style.css';

export default function AdvancedChartingSandbox() {
  return (
    <main className="min-h-screen bg-[#fafafa] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/doctor" className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-light tracking-wide text-sm">Doctor Dashboard</span>
        </Link>
        <h1 className="text-sm font-light text-slate-800 tracking-wide flex items-center gap-2">
          Advanced Restorative Charting
          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">BETA</span>
        </h1>
      </header>

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full flex flex-col md:flex-row gap-8">
        
        {/* Odontogram Section */}
        <div className="flex-grow bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-50 flex flex-col items-center overflow-x-auto min-h-[600px]">
          <div className="mb-6 text-center w-full max-w-2xl">
            <h2 className="text-2xl font-light text-slate-800 mb-2">Interactive Odontogram</h2>
            <p className="text-slate-400 font-light text-sm">
              This is a sandbox for the `react-advanced-odontogram` module. Click on surfaces to draw restorations, crowns, and endodontic treatments.
            </p>
          </div>
          
          <div className="w-full max-w-5xl bg-slate-50 rounded-2xl p-6 border border-slate-100 overflow-x-auto custom-scrollbar">
            <Odontogram />
          </div>
        </div>

        {/* State Debug Section */}
        <div className="w-full md:w-80 flex flex-col gap-6">
           <div className="bg-slate-900 rounded-3xl shadow-lg p-6 h-full flex flex-col text-slate-300 font-mono text-xs overflow-hidden">
             <h3 className="text-emerald-400 mb-4 font-semibold text-sm">Advanced Module</h3>
             <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 whitespace-pre-wrap break-all">
                The ZoliQua advanced odontogram shell manages its own state internally. Try interacting with the chart to test out its restorative and endodontic tools!
             </div>
           </div>
        </div>

      </div>
    </main>
  );
}
