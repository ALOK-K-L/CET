'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDoctorPatients, revokeDoctorAccess, updatePatient } from '@/app/actions';
import { Trash2, Edit2, X, Loader2 } from 'lucide-react';

export default function MyPatientsRoster() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const dId = localStorage.getItem('currentDoctorId');
    if (!dId) {
      router.push('/');
    } else {
      setDoctorId(dId);
      loadPatients(dId);
    }
  }, [router]);

  const loadPatients = (dId: string) => {
    getDoctorPatients(dId).then(setPatients).catch(console.error);
  };

  const handleRevoke = async (e: React.MouseEvent, patientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!doctorId) return;
    if (confirm('Are you sure you want to remove this patient from your roster? They will have to grant you access again.')) {
      try {
        await revokeDoctorAccess(patientId, doctorId);
        loadPatients(doctorId);
      } catch (err) {
        console.error(err);
        alert('Failed to revoke access.');
      }
    }
  };

  const openEdit = (e: React.MouseEvent, p: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPatient(p);
    setEditForm({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      email: p.email || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient || !doctorId) return;
    setIsSaving(true);
    try {
      await updatePatient(editingPatient.id, editForm);
      setEditingPatient(null);
      loadPatients(doctorId);
    } catch (err) {
      console.error(err);
      alert('Failed to update patient info.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!doctorId) return null;

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans flex flex-col relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/doctor" className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="font-light tracking-wide text-sm">Doctor Dashboard</span>
        </Link>
        <h1 className="text-sm font-light text-slate-800 tracking-wide">My Patients</h1>
      </header>

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-light text-slate-800 mb-2 tracking-tight">Patient Roster.</h2>
          <p className="text-slate-400 font-light text-sm max-w-md">Patients who have securely shared their clinical profile with you.</p>
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 border border-gray-50">
          {patients.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              </div>
              <h3 className="text-lg font-normal text-slate-800">No Patients Yet</h3>
              <p className="text-sm font-light text-slate-400 mt-1 max-w-md mx-auto">
                Return to the dashboard and ask a patient to scan your QR code or enter your 6-digit access PIN.
              </p>
              <Link href="/doctor" className="mt-6 inline-block px-6 py-2.5 bg-gray-50 border border-gray-100 hover:bg-gray-100 text-slate-600 font-medium rounded-xl transition-colors text-sm">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {patients.map(p => (
                <div key={p.id} className="relative group h-full">
                  <Link href={`/doctor/patient/${p.id}?doctorId=${doctorId}`} className="block h-full">
                    <div className="p-6 rounded-3xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-sky-100 transition-all hover:shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:-translate-y-1 h-full flex flex-col">
                      <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 font-medium text-lg mb-4">
                        {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                      </div>
                      <h3 className="text-lg font-normal text-slate-800 group-hover:text-sky-700 transition-colors">
                        {p.firstName} {p.lastName}
                      </h3>
                      <p className="text-xs text-slate-400 font-light mt-1 mb-2 font-mono">{p.email || 'No email'}</p>
                      
                      <div className="mt-auto pt-6">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-slate-300 group-hover:text-sky-500 transition-colors">
                          <span>Access Granted</span>
                          <span>{new Date(p.accessedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <button 
                      onClick={(e) => openEdit(e, p)}
                      className="p-2 bg-white text-slate-400 rounded-lg shadow-sm border border-gray-100 hover:text-sky-500 hover:border-sky-100 hover:bg-sky-50 transition-all"
                      title="Edit Patient Info"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleRevoke(e, p.id)}
                      className="p-2 bg-white text-slate-400 rounded-lg shadow-sm border border-gray-100 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all"
                      title="Remove Patient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Edit Patient Info</h3>
              <button onClick={() => setEditingPatient(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={editForm.firstName}
                  onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={editForm.lastName}
                  onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email (Optional)</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
