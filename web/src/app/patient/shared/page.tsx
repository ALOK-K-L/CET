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
          <p className="text-slate-400 max-w-lg mx-auto mb-10 text-sm font-light text-center leading-relaxed">
            Manage which doctors can see your records. Switch between <strong className="text-slate-600">Ongoing Sync</strong> (they see everything including future uploads) and <strong className="text-slate-600">Snapshot</strong> (they only see records up to this moment).
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
                const isOngoing = log.type === 'access_log';
                const isActionLoading = actionLoadingId === log.content;
                const isConfirmingRevoke = confirmRevokeId === log.content;

                return (
                  <div key={log.id} className={`p-5 rounded-2xl border transition-all ${isOngoing ? 'border-emerald-100 bg-emerald-50/30' : 'border-amber-100 bg-amber-50/30'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-medium text-lg border ${isOngoing ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {log.name.replace('Dr. ', '').charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-lg">{log.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isOngoing ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {isOngoing ? (
                                <><RefreshCw className="w-2.5 h-2.5" /> Ongoing Sync</>
                              ) : (
                                <><Camera className="w-2.5 h-2.5" /> Snapshot Only</>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-600">{new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100/80">
                      {/* Switch Access Type */}
                      <button
                        onClick={() => handleSwitch(log.content, log.type)}
                        disabled={isActionLoading}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                          isOngoing
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isOngoing ? (
                          <>
                            <Camera className="w-3.5 h-3.5" />
                            Switch to Snapshot
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            Switch to Ongoing Sync
                          </>
                        )}
                      </button>

                      {/* Revoke Access */}
                      {isConfirmingRevoke ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRevoke(log.content)}
                            disabled={isActionLoading}
                            className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmRevokeId(null)}
                            className="px-4 py-2.5 bg-gray-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRevokeId(log.content)}
                          disabled={isActionLoading}
                          className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-all disabled:opacity-50"
                        >
                          <ShieldOff className="w-3.5 h-3.5" />
                          Revoke Access
                        </button>
                      )}
                    </div>

                    {/* Info text */}
                    <p className="text-[10px] text-slate-400 mt-3 font-light">
                      {isOngoing
                        ? 'This doctor can see all your records including future uploads.'
                        : `This doctor can only see records uploaded before ${new Date(log.createdAt).toLocaleString('en-IN')}. New uploads are hidden.`
                      }
                    </p>
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
