'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPatientAccessHistory, revokeDoctorAccess, switchAccessType } from '@/app/actions';
import { ShieldCheck, ShieldOff, RefreshCw, Camera, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

export default function SharedDataHistoryPage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const pid = localStorage.getItem('currentPatientId');
    if (!pid) {
      router.push('/');
    } else {
      setPatientId(pid);
      loadHistory(pid);
    }
  }, [router]);

  const loadHistory = async (pid: string) => {
    setIsLoading(true);
    try {
      const data = await getPatientAccessHistory(pid);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (doctorId: string) => {
    if (!patientId) return;
    setActionLoadingId(doctorId);
    try {
      await revokeDoctorAccess(patientId, doctorId);
      setConfirmRevokeId(null);
      await loadHistory(patientId);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke access');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSwitch = async (doctorId: string, currentType: string) => {
    if (!patientId) return;
    setActionLoadingId(doctorId);
    const newType = currentType === 'access_log' ? 'snapshot' : 'ongoing';
    try {
      await switchAccessType(patientId, doctorId, newType as 'ongoing' | 'snapshot');
      await loadHistory(patientId);
    } catch (err: any) {
      alert(err.message || 'Failed to switch access type');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!patientId) return null;

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/patient" className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-light tracking-wide text-sm">Patient Portal</span>
        </Link>
        <h1 className="text-sm font-light text-slate-800 tracking-wide">Access Management</h1>
      </header>

      <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 border border-gray-50">
          
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-sky-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-light text-slate-800 mb-4 text-center tracking-tight">Doctor Access Control</h2>
          <p className="text-slate-400 font-light text-sm max-w-lg mb-8 leading-relaxed mx-auto text-center">
            Manage which doctors can see your records.
          </p>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-slate-400 italic font-light text-sm">You have not shared your data with any providers yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((log) => {
                const isActionLoading = actionLoadingId === log.content;
                const isConfirmingRevoke = revokeConfirmId === log.id;

                return (
                  <div key={log.id} className="p-5 rounded-2xl border border-gray-100 bg-white transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-medium text-lg border bg-gray-50 text-slate-600 border-gray-100">
                          {log.name.replace('Dr. ', '').charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-lg">{log.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-600">{new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100/80">
                      {/* Revoke Access */}
                      {isConfirmingRevoke ? (
                        <div className="flex items-center gap-2 w-full">
                          <button
                            onClick={() => handleRevoke(log.content)}
                            disabled={isActionLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                          >
                            {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                            Confirm
                          </button>
                          <button
                            onClick={() => setRevokeConfirmId(null)}
                            disabled={isActionLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-50 text-slate-600 hover:bg-gray-100 transition-all border border-gray-200 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRevokeConfirmId(log.id)}
                          disabled={isActionLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-all border border-rose-100 disabled:opacity-50"
                        >
                          <ShieldBan className="w-3.5 h-3.5" />
                          Revoke Access
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
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
