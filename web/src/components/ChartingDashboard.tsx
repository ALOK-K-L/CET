'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGeminiLive, PeriodontalChartUpdate } from '@/hooks/useGeminiLive';
import { saveExamination, getAllPatients, createPatientQuick } from '@/app/actions';
import Odontogram from 'react-odontogram';
import { UserPlus, Users, ArrowRight, Loader2 } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────

type SiteData = {
  pocket_depth?: number;
  recession?: number;
  bleeding?: boolean;
  is_correction?: boolean;
};

type ToothData = Record<string, SiteData>;
type ChartState = Record<number, ToothData>;

const ALL_SITES = ['mesio_facial', 'facial', 'disto_facial', 'mesio_lingual', 'lingual', 'disto_lingual'];
const SITE_LABELS: Record<string, string> = {
  mesio_facial: 'MF',
  facial: 'F',
  disto_facial: 'DF',
  mesio_lingual: 'ML',
  lingual: 'L',
  disto_lingual: 'DL',
};

// ── Component ────────────────────────────────────────────────────────────

export default function ChartingDashboard() {
  // Patient Selection States
  const [selectedPatient, setSelectedPatient] = useState<{id: string, firstName: string, lastName: string} | null>(null);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);

  // Charting States
  const [chart, setChart] = useState<ChartState>({});
  const [missingTeeth, setMissingTeeth] = useState<Set<number>>(new Set());
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Patients
  useEffect(() => {
    getAllPatients()
      .then(setPatientsList)
      .catch(console.error)
      .finally(() => setIsLoadingPatients(false));
  }, []);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim()) return;
    setIsCreatingPatient(true);
    try {
      const p = await createPatientQuick(newFirstName, newLastName);
      setSelectedPatient(p);
    } catch (err) {
      console.error(err);
      alert('Failed to create patient.');
    } finally {
      setIsCreatingPatient(false);
    }
  };

  const handleMeasurement = useCallback((data: PeriodontalChartUpdate) => {
    // Handle missing tooth
    if (data.is_missing) {
      setMissingTeeth(prev => new Set(prev).add(data.tooth_number));
    }

    // Handle site measurement - fallback to facial if AI didn't specify
    const site = data.site || 'facial';
    
    setChart(prev => {
      const toothData = { ...(prev[data.tooth_number] || {}) };
      const siteData = toothData[site] || {};
      
      // Smart Corrections: If correcting the tooth, ensure we wipe conflicting states from other sites
      // (e.g. if AI misheard 'mesial' the first time, and defaults to 'facial' on the correction)
      if (data.is_correction) {
        if (data.bleeding === false) {
          for (const key in toothData) {
            if (toothData[key]) toothData[key] = { ...toothData[key], bleeding: false };
          }
        }
        if (data.pocket_depth !== undefined && data.pocket_depth < 4) {
          // If correcting to a normal depth, clear out any deep pockets on this tooth 
          // so the odontogram doesn't stay yellow incorrectly.
          for (const key in toothData) {
            if (toothData[key] && (toothData[key].pocket_depth ?? 0) >= 4) {
               toothData[key] = { ...toothData[key], pocket_depth: undefined };
            }
          }
        }
      }

      toothData[site] = {
        ...siteData,
        ...(data.pocket_depth !== undefined && { pocket_depth: data.pocket_depth }),
        ...(data.recession !== undefined && { recession: data.recession }),
        ...(data.bleeding !== undefined && { bleeding: data.bleeding }),
        ...(data.is_correction !== undefined && { is_correction: data.is_correction }),
      };

      return {
        ...prev,
        [data.tooth_number]: toothData
      };
    });

    setSelectedTooth(data.tooth_number);
  }, []);

  const { isConnected, isRecording, startExam, stopExam, connectionError, chatLog } = useGeminiLive(handleMeasurement);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // ── Save to Database ───────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    setSaveResult(null);
    try {
      const result = await saveExamination(chart, Array.from(missingTeeth), selectedPatient.id);
      setSaveResult(`✅ Saved! Exam ${result.examinationId.slice(0, 8)}... — ${result.measurementCount} measurements for ${result.patientName}`);
    } catch (err: any) {
      setSaveResult(`❌ Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Print Report ───────────────────────────────────────────────────

  const handlePrint = () => {
    window.print();
  };

  // ── Universal → FDI mapping (react-odontogram uses FDI internally) ──
  const universalToFDI: Record<string, string> = {
    '8': '11', '7': '12', '6': '13', '5': '14', '4': '15', '3': '16', '2': '17', '1': '18',
    '9': '21', '10': '22', '11': '23', '12': '24', '13': '25', '14': '26', '15': '27', '16': '28',
    '25': '41', '26': '42', '27': '43', '28': '44', '29': '45', '30': '46', '31': '47', '32': '48',
    '24': '31', '23': '32', '22': '33', '21': '34', '20': '35', '19': '36', '18': '37', '17': '38',
  };

  const toFDI = (universalNums: string[]) => universalNums.map(u => {
    const fdi = universalToFDI[u];
    return fdi ? `teeth-${fdi}` : '';
  }).filter(Boolean);

  const bleedingTeeth = Object.keys(chart)
    .filter(t => Object.values(chart[Number(t)] || {}).some(d => d.bleeding));

  const deepPocketTeeth = Object.keys(chart)
    .filter(t => Object.values(chart[Number(t)] || {}).some(d => (d.pocket_depth ?? 0) >= 4) && !bleedingTeeth.includes(t));

  const normalTeeth = Object.keys(chart)
    .filter(t => Object.values(chart[Number(t)] || {}).some(d => (d.pocket_depth ?? 0) > 0) && !bleedingTeeth.includes(t) && !deepPocketTeeth.includes(t));

  const missingTeethStr = Array.from(missingTeeth).map(String);
  const allUniversal = Array.from({length: 32}, (_, i) => String(i + 1));
  
  // Teeth that have absolutely no data yet
  const unmeasuredTeeth = allUniversal.filter(t => 
    !bleedingTeeth.includes(t) && 
    !deepPocketTeeth.includes(t) && 
    !normalTeeth.includes(t) && 
    !missingTeethStr.includes(t)
  );

  const teethConditions = [
    { label: 'Uncharted', teeth: toFDI(unmeasuredTeeth), outlineColor: '#cbd5e1', fillColor: '#ffffff' },
    { label: 'Bleeding (BOP)', teeth: toFDI(bleedingTeeth), outlineColor: '#ef4444', fillColor: '#fee2e2' },
    { label: 'Deep Pocket (≥4mm)', teeth: toFDI(deepPocketTeeth), outlineColor: '#f59e0b', fillColor: '#fef3c7' },
    { label: 'Normal', teeth: toFDI(normalTeeth), outlineColor: '#10b981', fillColor: '#d1fae5' },
    { label: 'Missing', teeth: toFDI(missingTeethStr), outlineColor: '#9ca3af', fillColor: '#e5e7eb' },
  ];

  // ── Selected Tooth Detail ──────────────────────────────────────────

  const selectedToothData = selectedTooth ? chart[selectedTooth] : null;
  const isSelectedMissing = selectedTooth ? missingTeeth.has(selectedTooth) : false;

  // ── Stats ──────────────────────────────────────────────────────────

  const totalTeethCharted = Object.keys(chart).length;
  const totalSitesCharted = Object.values(chart).reduce((sum, sites) => sum + Object.keys(sites).length, 0);
  const totalBleeding = Object.values(chart).reduce((sum, sites) => sum + Object.values(sites).filter(s => s.bleeding).length, 0);

  // ── Render ─────────────────────────────────────────────────────────

  if (!selectedPatient) {
    return (
      <div className="font-sans max-w-4xl mx-auto py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-light text-slate-800 tracking-tight">Select Patient</h2>
          <p className="text-slate-500 font-light mt-2">Choose an existing patient or add a new one to begin the examination.</p>
        </div>

        {isAddingNew ? (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 max-w-md mx-auto border border-gray-50">
            <h3 className="text-xl font-normal text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus className="text-emerald-500 w-5 h-5" />
              Quick Add Patient
            </h3>
            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={newFirstName}
                  onChange={e => setNewFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={newLastName}
                  onChange={e => setNewLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  placeholder="Doe"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPatient}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isCreatingPatient ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-normal text-slate-800 flex items-center gap-2">
                <Users className="text-sky-500 w-5 h-5" />
                Patient Roster
              </h3>
              <button
                onClick={() => setIsAddingNew(true)}
                className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold text-sm rounded-lg transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Add New
              </button>
            </div>
            
            {isLoadingPatients ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
              </div>
            ) : patientsList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-light">
                No patients found in the roster. Add a new patient to begin.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {patientsList.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:bg-sky-50 hover:border-sky-200 transition-all group text-left"
                  >
                    <div>
                      <div className="font-medium text-slate-800 group-hover:text-sky-800 transition-colors">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {p.email || 'No email provided'}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="font-sans">
      {/* ── Header Bar ──────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6 print:mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Voice Capture
          </h2>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <p className="text-slate-500 text-sm">
                {isConnected ? 'Gemini AI Listening...' : 'Disconnected'}
              </p>
              <span className="text-slate-300 px-2">•</span>
              <p className="text-sky-600 font-semibold text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
            </div>
            {connectionError && (
              <p className="text-red-500 text-xs font-medium max-w-md">Error: {connectionError}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 print:hidden flex-wrap">
          <button
            onClick={() => {
              setChart(prev => {
                const updated = { ...prev };
                for (let t = 1; t <= 32; t++) {
                  if (!updated[t] && !missingTeeth.has(t)) {
                    updated[t] = { facial: { pocket_depth: 2, bleeding: false } };
                  }
                }
                return updated;
              });
            }}
            disabled={totalTeethCharted >= 32 - missingTeeth.size}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              totalTeethCharted >= 32 - missingTeeth.size
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-sky-100 text-sky-700 hover:bg-sky-200 border border-sky-200'
            }`}
          >
            ✅ Fill Remaining Normal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || totalTeethCharted === 0}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              totalTeethCharted === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isSaving ? 'Saving...' : '💾 Save to DB'}
          </button>
          <button
            onClick={handlePrint}
            disabled={totalTeethCharted === 0}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              totalTeethCharted === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-800'
            }`}
          >
            🖨️ Print Report
          </button>
          <button
            onClick={isRecording ? stopExam : startExam}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
              isRecording
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5'
            }`}
          >
            {isRecording ? '⏹ Stop Exam' : '🎙️ Start Exam'}
          </button>
        </div>
      </div>

      {saveResult && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium print:hidden ${saveResult.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {saveResult}
        </div>
      )}

      {/* ── Quick Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-slate-900">{totalTeethCharted}</div>
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Teeth</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-slate-900">{totalSitesCharted}</div>
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Sites</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-red-600">{totalBleeding}</div>
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">BOP</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-slate-900">{missingTeeth.size}</div>
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Missing</div>
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Odontogram + Detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Odontogram */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <Odontogram
              key={JSON.stringify(teethConditions)}
              notation="Universal"
              readOnly={true}
              teethConditions={teethConditions}
              layout="square"
              theme="light"
              tooltip={{
                content: (tooth: any) => (
                  <div className="p-1 text-center font-sans">
                    <div className="font-bold text-sm text-white">
                      Tooth #{tooth.notations?.universal || tooth.id}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">
                      {tooth.type}
                    </div>
                  </div>
                )
              }}
            />
            <div className="flex gap-5 mt-6 justify-center flex-wrap">
              {[
                { color: 'bg-red-100 border-red-500', label: 'Bleeding' },
                { color: 'bg-amber-100 border-amber-500', label: 'Deep (≥4mm)' },
                { color: 'bg-emerald-100 border-emerald-500', label: 'Normal' },
                { color: 'bg-gray-200 border-gray-400', label: 'Missing' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded border ${item.color}`} />
                  <span className="text-xs font-medium text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Tooth Detail Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">
                {selectedTooth ? `Tooth ${selectedTooth} — Detail` : 'Select a tooth to view details'}
              </h3>
              {selectedTooth && isSelectedMissing && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">MISSING</span>
              )}
            </div>

            {selectedTooth && !isSelectedMissing ? (
              <div className="grid grid-cols-6 gap-2">
                {ALL_SITES.map(site => {
                  const data = selectedToothData?.[site];
                  const pd = data?.pocket_depth;
                  const hasBleeding = data?.bleeding;
                  const rec = data?.recession;

                  return (
                    <div
                      key={site}
                      className={`rounded-xl p-3 text-center border transition-colors ${
                        hasBleeding ? 'bg-red-50 border-red-200' :
                        pd && pd >= 4 ? 'bg-amber-50 border-amber-200' :
                        pd ? 'bg-emerald-50 border-emerald-200' :
                        'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {SITE_LABELS[site]}
                      </div>
                      <div className={`text-xl font-extrabold ${
                        hasBleeding ? 'text-red-600' :
                        pd && pd >= 4 ? 'text-amber-600' :
                        pd ? 'text-emerald-600' :
                        'text-slate-300'
                      }`}>
                        {pd ?? '—'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {hasBleeding ? '🩸 BOP' : ''}
                        {rec ? ` R:${rec}` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : !selectedTooth ? (
              <div className="text-center py-8 text-slate-300 text-sm">
                Dictate a measurement to see tooth details here
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Live Chat Log */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[600px] overflow-hidden print:hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Live Transcript</h3>
            <p className="text-[11px] text-slate-400">Voice capture & AI structured output</p>
          </div>

          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2">
            {chatLog.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-300 text-sm italic">
                Click &apos;Start Exam&apos; to begin...
              </div>
            ) : (
              chatLog.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[90%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm self-end'
                      : msg.sender === 'ai'
                      ? 'bg-slate-100 text-slate-800 rounded-tl-sm self-start'
                      : 'bg-blue-50 text-blue-700 rounded-tl-sm self-start text-xs italic'
                  } ${!msg.isFinal && msg.sender === 'user' ? 'opacity-40' : ''}`}
                >
                  {msg.text}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* ── Bottom: Full Clinical Data Grid ─────────────────────────── */}
      {totalTeethCharted > 0 && (
        <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Detailed Clinical Measurements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-2 font-semibold rounded-tl-lg">Tooth</th>
                  {ALL_SITES.map(site => (
                    <th key={site} className="text-center p-2 font-semibold">{SITE_LABELS[site]}</th>
                  ))}
                  <th className="text-center p-2 font-semibold rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(chart).sort((a, b) => Number(a) - Number(b)).map(toothNumStr => {
                  const toothNum = Number(toothNumStr);
                  const toothData = chart[toothNum];
                  const isMissing = missingTeeth.has(toothNum);

                  return (
                    <tr
                      key={toothNum}
                      className={`cursor-pointer transition-colors ${selectedTooth === toothNum ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      onClick={() => setSelectedTooth(toothNum)}
                    >
                      <td className="p-2 font-bold text-slate-800">#{toothNum}</td>
                      {ALL_SITES.map(site => {
                        const siteData = toothData?.[site];
                        const pd = siteData?.pocket_depth;
                        const hasBleeding = siteData?.bleeding;
                        return (
                          <td key={site} className="p-2 text-center">
                            {pd !== undefined ? (
                              <span className={`inline-flex items-center gap-1 font-semibold ${
                                hasBleeding ? 'text-red-600' :
                                pd >= 4 ? 'text-amber-600' :
                                'text-slate-700'
                              }`}>
                                {pd}
                                {hasBleeding && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />}
                              </span>
                            ) : (
                              <span className="text-slate-200">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center">
                        {isMissing ? (
                          <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">MISSING</span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">PRESENT</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
