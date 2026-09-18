'use client';

import { useState } from 'react';
import { Search, Sparkles, Loader2, X, Clock, Calendar } from 'lucide-react';
import { analyzeRecord } from '@/app/actions';

type RecordType = {
  id: string;
  name: string;
  type: string;
  content: string;
  createdAt: Date;
};

type AnalysisResult = {
  analysis: string;
  analyzedAt: string;
  recordName: string;
  patientName: string;
};

function formatTimestamp(date: Date) {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { dateStr, timeStr };
}

function RecordCard({ record, accentColor, onAnalyze, isAnalyzing }: {
  record: RecordType;
  accentColor: 'sky' | 'slate' | 'emerald';
  onAnalyze: (id: string) => void;
  isAnalyzing: boolean;
}) {
  const { dateStr, timeStr } = formatTimestamp(record.createdAt);
  const colorMap = {
    sky: { bg: 'bg-sky-50/50', border: 'border-sky-100', icon: 'bg-sky-100 text-sky-600', badge: 'bg-sky-100 text-sky-700' },
    slate: { bg: 'bg-gray-50', border: 'border-gray-100', icon: 'bg-white border border-gray-100 text-slate-500', badge: 'bg-gray-100 text-slate-600' },
    emerald: { bg: 'bg-emerald-50/50', border: 'border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  };
  const c = colorMap[accentColor];

  return (
    <div className={`p-4 rounded-2xl border ${c.border} ${c.bg} flex flex-col gap-3`}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center font-medium text-xs flex-shrink-0`}>
          {record.type.includes('pdf') ? 'PDF' : record.type.includes('image') ? 'IMG' : 'TXT'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-800 truncate">{record.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              {timeStr}
            </span>
          </div>

          {record.type.includes('text') && !record.type.includes('doctor_examination') && (
            <p className="text-sm font-light text-slate-600 mt-2 bg-white p-3 rounded-xl border border-gray-100">{record.content}</p>
          )}
          {record.type.includes('image') && (
            <img src={record.content} className="mt-2 h-24 rounded-lg object-cover border border-gray-100" alt="Record" />
          )}
          {record.type.includes('pdf') && (
            <a href={record.content} download={`${record.name}.pdf`} className="text-xs font-medium text-sky-600 hover:underline mt-2 inline-block">Download PDF ↓</a>
          )}
        </div>
      </div>

      {/* AI Analysis Button */}
      <button
        onClick={() => onAnalyze(record.id)}
        disabled={isAnalyzing}
        className="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-wait"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            AI Analysis
          </>
        )}
      </button>
    </div>
  );
}

export default function PatientRecordsViewer({ records }: { records: RecordType[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploaderFilter, setUploaderFilter] = useState<'all' | 'patient' | 'doctor'>('all');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = async (recordId: string) => {
    setAnalyzingId(recordId);
    setAnalysisError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeRecord(recordId);
      setAnalysisResult(result);
    } catch (err: any) {
      setAnalysisError(err.message || 'Analysis failed');
    } finally {
      setAnalyzingId(null);
    }
  };

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
      {/* AI Analysis Modal */}
      {(analysisResult || analysisError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">AI Analysis</h3>
                  {analysisResult && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {analysisResult.recordName} · {analysisResult.patientName} · {new Date(analysisResult.analyzedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => { setAnalysisResult(null); setAnalysisError(null); }}
                className="p-2 hover:bg-white/80 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {analysisError ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-red-600 font-medium">Analysis Failed</p>
                  <p className="text-sm text-slate-500 mt-2">{analysisError}</p>
                </div>
              ) : analysisResult ? (
                <div className="prose prose-sm prose-slate max-w-none">
                  {/* Render markdown-ish content */}
                  {analysisResult.analysis.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h3 key={i} className="text-lg font-bold text-slate-800 mt-4 mb-2">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('### ')) {
                      return <h4 key={i} className="text-base font-semibold text-slate-700 mt-3 mb-1">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-semibold text-slate-800 mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return <li key={i} className="ml-4 text-slate-600 mb-1">{line.replace(/^[-*] /, '')}</li>;
                    }
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i} className="text-slate-600 mb-1">{line}</p>;
                  })}
                </div>
              ) : null}
            </div>

            {/* Footer with timestamp */}
            {analysisResult && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Analyzed at {new Date(analysisResult.analyzedAt).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400">Powered by Gemini AI</span>
              </div>
            )}
          </div>
        </div>
      )}

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
                        <RecordCard key={record.id} record={record} accentColor="sky" onAnalyze={handleAnalyze} isAnalyzing={analyzingId === record.id} />
                      ))}
                    </div>
                  </div>
                )}

                {generalPatient.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Self Uploaded (Patient)</h3>
                    <div className="space-y-4">
                      {generalPatient.map(record => (
                        <RecordCard key={record.id} record={record} accentColor="slate" onAnalyze={handleAnalyze} isAnalyzing={analyzingId === record.id} />
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
                        <RecordCard key={record.id} record={record} accentColor="emerald" onAnalyze={handleAnalyze} isAnalyzing={analyzingId === record.id} />
                      ))}
                    </div>
                  </div>
                )}

                {medicinalPatient.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Self Uploaded (Patient)</h3>
                    <div className="space-y-4">
                      {medicinalPatient.map(record => (
                        <RecordCard key={record.id} record={record} accentColor="slate" onAnalyze={handleAnalyze} isAnalyzing={analyzingId === record.id} />
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
