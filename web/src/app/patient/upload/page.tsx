'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPatientRecord, getPatientRecords, deletePatientRecord } from '@/app/actions';

type RecordType = {
  id: string;
  name: string;
  type: string;
  content: string;
  createdAt: Date;
};

export default function UploadRecordsPage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<'general' | 'medicine'>('general');

  // Form State
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Records State
  const [records, setRecords] = useState<RecordType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploaderFilter, setUploaderFilter] = useState<'all' | 'patient' | 'doctor'>('all');
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  useEffect(() => {
    const pid = localStorage.getItem('currentPatientId');
    if (!pid) {
      router.push('/');
    } else {
      setPatientId(pid);
      loadRecords(pid);
    }
  }, [router]);

  const loadRecords = async (pid: string) => {
    setIsLoadingRecords(true);
    try {
      const data = await getPatientRecords(pid);
      setRecords(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await deletePatientRecord(recordId);
      if (patientId) loadRecords(patientId);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete record.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !name) return;
    
    if (!note && !file) {
      alert("Please provide either a note or upload a file.");
      return;
    }

    setIsSubmitting(true);
    try {
      let content = note;
      let baseType = 'text';

      // Convert file to base64 for easy DB storage
      if (file) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
        content = base64;
        baseType = file.type.includes('pdf') ? 'pdf' : 'image';
      }

      // Add "medicine_" prefix if in medicine tab
      const finalType = activeTab === 'medicine' ? `medicine_${baseType}` : baseType;

      await createPatientRecord(patientId, name, finalType, content);
      
      // Reset form
      setName('');
      setNote('');
      setFile(null);
      
      // Reload records
      loadRecords(patientId);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter by search AND tab category
  const filteredRecords = records.filter(r => {
    // Hide system records
    if (r.type === 'access_log' || r.type === 'access_log_snapshot' || r.type === 'share_code') return false;

    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.type.includes('text') && r.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const isMedicine = r.type.includes('medicine_');
    const matchesTab = activeTab === 'medicine' ? isMedicine : !isMedicine;

    let matchesUploader = true;
    const isDoctor = r.type.startsWith('doctor_');
    if (uploaderFilter === 'doctor') matchesUploader = isDoctor;
    if (uploaderFilter === 'patient') matchesUploader = !isDoctor;

    return matchesSearch && matchesTab && matchesUploader;
  });

  const patientUploads = filteredRecords.filter(r => !r.type.startsWith('doctor_'));
  const doctorUploads = filteredRecords.filter(r => r.type.startsWith('doctor_'));

  if (!patientId) return null;

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/patient" className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="font-light tracking-wide text-sm">Patient Portal</span>
        </Link>
        <h1 className="text-sm font-light text-slate-800 tracking-wide">Manage Health Records</h1>
      </header>

      <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-50 p-1 rounded-xl w-fit border border-gray-100 mx-auto sm:mx-0">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'general' ? 'bg-white text-sky-700 shadow-sm border border-gray-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            General Records
          </button>
          <button 
            onClick={() => setActiveTab('medicine')}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'medicine' ? 'bg-white text-emerald-700 shadow-sm border border-gray-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Medicines & Prescriptions
          </button>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-50 mb-10">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${activeTab === 'medicine' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
              {activeTab === 'medicine' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {activeTab === 'medicine' ? 'Add Medicinal Record' : 'Upload Medical Record'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'medicine' ? 'Log your past prescriptions, pills, or pharmacy receipts.' : 'Upload clinical reports, X-rays, or general health notes.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {activeTab === 'medicine' ? 'Medicine / Prescription Name' : 'Record Name'}
              </label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={activeTab === 'medicine' ? 'e.g., Amoxicillin 500mg, Advil' : 'e.g., Blood Test Report, Dental X-Ray'}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:outline-none transition-all ${activeTab === 'medicine' ? 'focus:border-emerald-500 focus:ring-emerald-500' : 'focus:border-sky-500 focus:ring-sky-500'}`}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 transition-all relative ${activeTab === 'medicine' ? 'hover:bg-emerald-50 hover:border-emerald-200' : 'hover:bg-sky-50 hover:border-sky-200'}`}>
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${activeTab === 'medicine' ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-100 text-sky-600'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <p className="text-sm font-medium text-slate-700">Upload File (PDF/Image)</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Click to browse files</p>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file && <div className="text-xs font-medium text-slate-700 bg-white shadow-sm border border-gray-200 px-3 py-1 rounded-full">{file.name}</div>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {activeTab === 'medicine' ? 'Or type medicinal instructions' : 'Or write a clinical note'}
                </label>
                <textarea 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={activeTab === 'medicine' ? 'Take 2 pills daily after meals...' : 'I have been experiencing a mild toothache...'}
                  className={`w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:outline-none transition-all resize-none ${activeTab === 'medicine' ? 'focus:border-emerald-500 focus:ring-emerald-500' : 'focus:border-sky-500 focus:ring-sky-500'}`}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 text-white font-medium text-sm rounded-xl transition-all disabled:opacity-50 ${activeTab === 'medicine' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#0277bd] hover:bg-[#0266a2]'}`}
              >
                {isSubmitting ? 'Uploading...' : `Save ${activeTab === 'medicine' ? 'Medicine' : 'Record'}`}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Records Section */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-xl font-light text-slate-800 tracking-tight">
              {activeTab === 'medicine' ? 'My Medicines' : 'My General Records'}
            </h2>
            
            {/* Search Filter */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setUploaderFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${uploaderFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setUploaderFilter('patient')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${uploaderFilter === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Me
                </button>
                <button 
                  onClick={() => setUploaderFilter('doctor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${uploaderFilter === 'doctor' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Doctor
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:outline-none transition-all ${activeTab === 'medicine' ? 'focus:ring-emerald-500' : 'focus:ring-blue-500'}`}
                />
              </div>
            </div>
          </div>

          {isLoadingRecords ? (
            <div className="text-center py-12 text-slate-400 font-medium">Loading...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-slate-500 font-medium">
                {activeTab === 'medicine' ? 'No medicines found.' : 'No general records found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* Doctor Uploads Section */}
              {doctorUploads.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Uploaded by Doctor</h3>
                  <div className="space-y-4">
                    {doctorUploads.map(record => (
                      <div key={record.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 transition-colors group relative">
                        {/* Delete Button (Visible on Hover) */}
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Record"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>

                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-100 text-indigo-600`}>
                          {record.type.includes('pdf') ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          ) : record.type.includes('image') ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-10">
                          <h3 className="font-bold text-slate-800 truncate">{record.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">Added by Doctor on {new Date(record.createdAt).toLocaleDateString()}</p>
                          
                          {record.type.includes('text') && (
                            <p className="text-sm text-slate-600 mt-3 bg-white p-3 rounded-xl border border-indigo-100">{record.content}</p>
                          )}
                          {record.type.includes('image') && (
                            <div className="mt-3">
                              <img src={record.content} alt={record.name} className="h-32 rounded-xl object-cover border border-slate-200" />
                            </div>
                          )}
                          {record.type.includes('pdf') && (
                            <div className="mt-3">
                              <a href={record.content} download={`${record.name}.pdf`} className="text-sm font-semibold text-blue-600 hover:underline">Download PDF ↓</a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient Uploads Section */}
              {patientUploads.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">My Uploads</h3>
                  <div className="space-y-4">
                    {patientUploads.map(record => (
                      <div key={record.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group relative">
                        
                        {/* Delete Button (Visible on Hover) */}
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Record"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>

                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${activeTab === 'medicine' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
                          {record.type.includes('pdf') ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          ) : record.type.includes('image') ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-10">
                          <h3 className="font-bold text-slate-800 truncate">{record.name}</h3>
                          <p className="text-xs text-slate-400 mt-1">Added on {new Date(record.createdAt).toLocaleDateString()}</p>
                          
                          {record.type.includes('text') && (
                            <p className="text-sm text-slate-600 mt-3 bg-white p-3 rounded-xl border border-slate-100">{record.content}</p>
                          )}
                          {record.type.includes('image') && (
                            <div className="mt-3">
                              <img src={record.content} alt={record.name} className="h-32 rounded-xl object-cover border border-slate-200" />
                            </div>
                          )}
                          {record.type.includes('pdf') && (
                            <div className="mt-3">
                              <a href={record.content} download={`${record.name}.pdf`} className="text-sm font-semibold text-blue-600 hover:underline">Download PDF ↓</a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
