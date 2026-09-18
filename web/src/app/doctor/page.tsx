'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DoctorQRModal from '@/components/DoctorQRModal';
import Link from 'next/link';
import { getDoctorPatients } from '@/app/actions';

export default function DoctorDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const dId = localStorage.getItem('currentDoctorId');
    if (!dId) {
      router.push('/');
    } else {
      setDoctorId(dId);
    }
  }, [router]);

  if (!doctorId) return null;

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans flex flex-col py-0 print:py-2 print:bg-white">
      {/* Modal */}
      <DoctorQRModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} doctorId={doctorId} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-600">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
            <span className="font-bold text-lg">D</span>
          </div>
          <div>
            <h1 className="font-light tracking-wide text-sm text-slate-800">Doctor Portal</h1>
            <p className="text-[10px] font-light text-slate-400">Smart Operatory</p>
          </div>
        </div>
        <div className="flex items-center gap-4 print:hidden">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-medium text-white bg-[#0277bd] hover:bg-[#0266a2] transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            My QR
          </button>
          <Link 
            href="/"
            className="text-slate-500 hover:text-slate-800 font-light text-xs transition-colors px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-50"
          >
            Sign Out
          </Link>
        </div>
      </header>

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Dashboard Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
          
          {/* Voice Capture Card */}
          <Link href="/doctor/charting" className="group block">
            <div className="bg-white border border-gray-50 rounded-3xl p-8 h-full transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
              <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-6 text-sky-600 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <h3 className="text-lg font-normal text-slate-800 mb-2">Voice Capture</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Launch the AI-powered real-time periodontal voice charting operatory.
              </p>
            </div>
          </Link>

          {/* My Patients Card */}
          <Link href="/doctor/patients" className="group block">
            <div className="bg-white border border-gray-50 rounded-3xl p-8 h-full transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-lg font-normal text-slate-800 mb-2">My Patients Roster</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                View your roster of patients who have granted you access to their medical files and records.
              </p>
            </div>
          </Link>

          {/* Database Viewer Card */}
          <Link href="/database" className="group block">
            <div className="bg-white border border-gray-50 rounded-3xl p-8 h-full transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 text-slate-600 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              </div>
              <h3 className="text-lg font-normal text-slate-800 mb-2">Database Access</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Direct developer access to view raw data records across the entire system.
              </p>
            </div>
          </Link>

          {/* Advanced Charting Beta Card */}
          <Link href="/doctor/advanced-charting" className="group block">
            <div className="bg-white border border-gray-50 rounded-3xl p-8 h-full transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">BETA</div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 text-amber-600 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-lg font-normal text-slate-800 mb-2">Advanced Charting</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Experimental playground for restorative charting (Crowns, Fillings, Endo).
              </p>
            </div>
          </Link>

        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-xs font-light text-slate-400 tracking-wide mt-auto border-t border-gray-100 bg-white">
        Lumiere Doctor Portal • E2E Encrypted Sync
      </footer>
    </main>
  );
}
