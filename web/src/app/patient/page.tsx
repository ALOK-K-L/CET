'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientDashboard() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // In a real app, we'd use a server-side session. For hackathon, grabbing from localStorage
    const pid = localStorage.getItem('currentPatientId');
    if (!pid) {
      router.push('/');
    } else {
      setPatientId(pid);
    }
  }, [router]);

  if (!patientId) return null; // or loading spinner

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans flex flex-col">
      {/* Premium Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-600">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
            <span className="font-bold text-lg">P</span>
          </div>
          <h1 className="font-light tracking-wide text-sm">Patient Portal</h1>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('currentPatientId');
            router.push('/');
          }}
          className="text-slate-500 hover:text-slate-800 font-light text-xs transition-colors px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-50"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-light text-slate-800 mb-2 tracking-tight">Welcome Back.</h2>
          <p className="text-slate-400 font-light text-sm max-w-md">Manage your clinical records, view prescriptions, and track your dental health in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Upload Records Card */}
          <Link href="/patient/upload" className="group block">
            <div className="bg-white border border-gray-50 rounded-3xl p-8 h-full transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
              <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-6 text-sky-600 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <h3 className="text-lg font-normal text-slate-800 mb-2">My Records</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Securely upload medical files or view clinical notes and prescriptions from your doctor.
              </p>
            </div>
          </Link>

          {/* Share Profile Card */}
          <Link href="/patient/share" className="group block">
            <div className="bg-white border border-gray-50 rounded-3xl p-8 h-full transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </div>
              <h3 className="text-lg font-normal text-slate-800 mb-2">Share Profile</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Grant instant, secure access to your clinical records by scanning your provider's QR pass.
              </p>
            </div>
          </Link>

          {/* Shared Data Card */}
          <Link href="/patient/shared" className="group block">
            <div className="bg-white border border-gray-50 rounded-3xl p-8 h-full transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-lg font-normal text-slate-800 mb-2">Access History</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                View exactly who has been granted access to your medical records, and revoke access instantly.
              </p>
            </div>
          </Link>

        </div>

        <div className="mt-12 bg-white rounded-2xl p-6 border border-gray-100 flex items-center justify-between shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="font-normal text-sm text-slate-800">Need Help?</h4>
              <p className="text-xs font-light text-slate-400">Contact the clinic desk for any assistance.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-slate-600 hover:bg-gray-100 transition-colors">
            Contact Clinic
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-xs font-light text-slate-400 tracking-wide mt-auto border-t border-gray-100 bg-white">
        Lumiere Patient Portal • E2E Encrypted Sync
      </footer>
    </main>
  );
}
