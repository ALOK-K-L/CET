'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

type RecordType = {
  id: string;
  name: string;
  type: string;
  content: string;
  createdAt: Date;
};

export default function PatientRecordsViewer({ records }: { records: RecordType[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploaderFilter, setUploaderFilter] = useState<'all' | 'patient' | 'doctor'>('all');

  // Filter records based on search and uploader filter
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.type.includes('text') && r.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesUploader = true;
    const isDoctor = r.type.startsWith('doctor_');
    if (uploaderFilter === 'doctor') matchesUploader = isDoctor;
    if (uploaderFilter === 'patient') matchesUploader = !isDoctor;

    return matchesSearch && matchesUploader;
  });

  const generalRecords = filteredRecords.filter(r => !r.type.includes('medicine_'));
  const medicinalRecords = filteredRecords.filter(r => r.type.includes('medicine_'));

  const generalPatient = generalRecords.filter(r => !r.type.startsWith('doctor_'));
  const generalDoctor = generalRecords.filter(r => r.type.startsWith('doctor_'));

  const medicinalPatient = medicinalRecords.filter(r => !r.type.startsWith('doctor_'));
  const medicinalDoctor = medicinalRecords.filter(r => r.type.startsWith('doctor_'));

  return (
    <>
      {/* Search and Filter Controls */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-50">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search records or notes..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button 
            onClick={() => setUploaderFilter('all')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all ${uploaderFilter === 'all' ? 'bg-white text-slate-800 shadow-sm border border-gray-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All Records
          </button>
          <button 
            onClick={() => setUploaderFilter('patient')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all ${uploaderFilter === 'patient' ? 'bg-white text-sky-700 shadow-sm border border-gray-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Self Uploaded
          </button>
          <button 
            onClick={() => setUploaderFilter('doctor')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all ${uploaderFilter === 'doctor' ? 'bg-white text-emerald-700 shadow-sm border border-gray-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            By Doctor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Records Column */}
        <div>
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-50 h-full">
            <h2 className="text-xl font-light text-slate-800 mb-6 flex items-center gap-2 tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              General Medical Records
            </h2>

            {generalRecords.length === 0 ? (
              <p className="text-slate-400 font-light text-sm italic">No general records match your search.</p>
            ) : (
              <div className="space-y-8">
                {generalDoctor.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Uploaded by Doctor</h3>
                    <div className="space-y-4">
                      {generalDoctor.map(record => (
                        <div key={record.id} className="p-4 rounded-2xl border border-sky-100 bg-sky-50/50 flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 font-medium text-xs flex-shrink-0">
                            {record.type.includes('pdf') ? 'PDF' : record.type.includes('image') ? 'IMG' : 'TXT'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-800 truncate">{record.name}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">{new Date(record.createdAt).toLocaleDateString()}</p>
                            
                            {record.type.includes('text') && <p className="text-sm font-light text-slate-600 mt-2 bg-white p-3 rounded-xl border border-gray-100">{record.content}</p>}
                            {record.type.includes('image') && <img src={record.content} className="mt-2 h-24 rounded-lg object-cover border border-gray-100" alt="Record" />}
                            {record.type.includes('pdf') && <a href={record.content} download={`${record.name}.pdf`} className="text-xs font-medium text-sky-600 hover:underline mt-2 inline-block">Download PDF ↓</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generalPatient.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Self Uploaded (Patient)</h3>
                    <div className="space-y-4">
                      {generalPatient.map(record => (
                        <div key={record.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-slate-500 font-medium text-xs flex-shrink-0">
                            {record.type.includes('pdf') ? 'PDF' : record.type.includes('image') ? 'IMG' : 'TXT'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-800 truncate">{record.name}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">{new Date(record.createdAt).toLocaleDateString()}</p>
                            
                            {record.type.includes('text') && <p className="text-sm font-light text-slate-600 mt-2 bg-white p-3 rounded-xl border border-gray-100">{record.content}</p>}
                            {record.type.includes('image') && <img src={record.content} className="mt-2 h-24 rounded-lg object-cover border border-gray-100" alt="Record" />}
                            {record.type.includes('pdf') && <a href={record.content} download={`${record.name}.pdf`} className="text-xs font-medium text-slate-600 hover:underline mt-2 inline-block">Download PDF ↓</a>}
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

        {/* Medicinal Records Column */}
        <div>
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-50 h-full">
            <h2 className="text-xl font-light text-slate-800 mb-6 flex items-center gap-2 tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              Medicines & Prescriptions
            </h2>

            {medicinalRecords.length === 0 ? (
              <p className="text-slate-400 font-light text-sm italic">No medicines match your search.</p>
            ) : (
              <div className="space-y-8">
                {medicinalDoctor.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Uploaded by Doctor</h3>
                    <div className="space-y-4">
                      {medicinalDoctor.map(record => (
                        <div key={record.id} className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium text-xs flex-shrink-0">
                            {record.type.includes('pdf') ? 'PDF' : record.type.includes('image') ? 'IMG' : 'TXT'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-800 truncate">{record.name}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">{new Date(record.createdAt).toLocaleDateString()}</p>
                            
                            {record.type.includes('text') && <p className="text-sm font-light text-slate-600 mt-2 bg-white p-3 rounded-xl border border-gray-100">{record.content}</p>}
                            {record.type.includes('image') && <img src={record.content} className="mt-2 h-24 rounded-lg object-cover border border-gray-100" alt="Medicine" />}
                            {record.type.includes('pdf') && <a href={record.content} download={`${record.name}.pdf`} className="text-xs font-medium text-emerald-600 hover:underline mt-2 inline-block">Download PDF ↓</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {medicinalPatient.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Self Uploaded (Patient)</h3>
                    <div className="space-y-4">
                      {medicinalPatient.map(record => (
                        <div key={record.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-slate-500 font-medium text-xs flex-shrink-0">
                            {record.type.includes('pdf') ? 'PDF' : record.type.includes('image') ? 'IMG' : 'TXT'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-800 truncate">{record.name}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">{new Date(record.createdAt).toLocaleDateString()}</p>
                            
                            {record.type.includes('text') && <p className="text-sm font-light text-slate-600 mt-2 bg-white p-3 rounded-xl border border-gray-100">{record.content}</p>}
                            {record.type.includes('image') && <img src={record.content} className="mt-2 h-24 rounded-lg object-cover border border-gray-100" alt="Medicine" />}
                            {record.type.includes('pdf') && <a href={record.content} download={`${record.name}.pdf`} className="text-xs font-medium text-slate-600 hover:underline mt-2 inline-block">Download PDF ↓</a>}
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
      </div>
    </>
  );
}
