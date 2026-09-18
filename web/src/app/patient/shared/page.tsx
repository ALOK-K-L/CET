'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPatientAccessHistory } from '@/app/actions';

export default function SharedDataHistoryPage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const pid = localStorage.getItem('currentPatientId');
    if (!pid) {
      router.push('/');
    } else {
      setPatientId(pid);
      getPatientAccessHistory(pid).then(setHistory).catch(console.error);
    }
  }, [router]);

  if (!patientId) return null;

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/patient" className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="font-light tracking-wide text-sm">Patient Portal</span>
        </Link>
        <h1 className="text-sm font-light text-slate-800 tracking-wide">Shared Data Logs</h1>
      </header>

      <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 border border-gray-50">
          
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-sky-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          
          <h2 className="text-2xl font-light text-slate-800 mb-4 text-center tracking-tight">Data Access History</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-10 text-sm font-light text-center leading-relaxed">
            View exactly which doctors have been granted access to your medical profile.
          </p>

          {history.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-slate-400 italic font-light text-sm">You have not shared your data with any providers yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:border-sky-100 hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 font-medium text-lg border border-sky-100/50">
                      {log.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <p className="font-normal text-slate-800 text-lg">{log.name}</p>
                      <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide mt-0.5">Access Granted</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{new Date(log.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 font-light">{new Date(log.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-xs font-light text-slate-400 tracking-wide mt-auto border-t border-gray-100 bg-white">
        Lumiere Patient Portal • E2E Encrypted Sync
      </footer>
    </main>
  );
}
