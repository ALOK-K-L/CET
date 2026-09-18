'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGeminiLive, PeriodontalChartUpdate } from '@/hooks/useGeminiLive';
import { saveExamination, getAllPatients, createPatientQuick, getPatientExaminations, createPatientRecord, generateClinicalReport } from '@/app/actions';
import Odontogram from 'react-odontogram';
import { UserPlus, Users, ArrowRight, Loader2, X, History, Calendar, Sparkles } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────

type SiteData = {
  pocket_depth?: number;
  recession?: number;
  bleeding?: boolean;
  plaque?: boolean;
  calculus?: boolean;
  suppuration?: boolean;
  mobility?: number;
  furcation?: number;
  is_normal?: boolean;
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
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiReportError, setAiReportError] = useState<string | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Past Record States
  const [showPastRecord, setShowPastRecord] = useState(false);
  const [pastRecordData, setPastRecordData] = useState<any | null>(null);
  const [isLoadingPastRecord, setIsLoadingPastRecord] = useState(false);

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
    
    // Handle clearing the tooth completely (e.g. cross-tooth corrections)
    if (data.is_clear_tooth) {
      setChart(prev => {
        const updated = { ...prev };
        delete updated[data.tooth_number];
        return updated;
      });
      setMissingTeeth(prev => {
        const updated = new Set(prev);
        updated.delete(data.tooth_number);
        return updated;
      });
      setSelectedTooth(data.tooth_number);
      return;
    }

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
        ...(data.is_normal !== undefined && { is_normal: data.is_normal }),
        ...(data.plaque !== undefined && { plaque: data.plaque }),
        ...(data.calculus !== undefined && { calculus: data.calculus }),
        ...(data.suppuration !== undefined && { suppuration: data.suppuration }),
        ...(data.mobility !== undefined && { mobility: data.mobility }),
        ...(data.furcation !== undefined && { furcation: data.furcation }),
      };

      return {
        ...prev,
        [data.tooth_number]: toothData
      };
    });

    setSelectedTooth(data.tooth_number);
  }, []);

  const handleTogglePastRecord = useCallback(async (show: boolean) => {
    setShowPastRecord(show);
    if (show && selectedPatient) {
      setIsLoadingPastRecord(true);
      try {
        const exams = await getPatientExaminations(selectedPatient.id);
        if (exams.length > 0) {
          setPastRecordData(exams[0]); // Load the most recent completed exam
        } else {
          setPastRecordData(null); // No past records
        }
      } catch (err) {
        console.error('Failed to load past record:', err);
      } finally {
        setIsLoadingPastRecord(false);
      }
    }
  }, [selectedPatient]);

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
    .filter(t => Object.values(chart[Number(t)] || {}).some(d => (d.pocket_depth ?? 0) > 0 || d.is_normal) && !bleedingTeeth.includes(t) && !deepPocketTeeth.includes(t));

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

  const handleSaveAndShare = useCallback(async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    setSaveResult(null);
    try {
      const result = await saveExamination(chart, Array.from(missingTeeth), selectedPatient.id);
      
      // Also generate a PatientRecord with the detailed chart data so the AI can analyze it later
      const reportName = `Periodontal Chart - ${new Date().toLocaleDateString()}`;
      const fullData = { rawChart: chart, missingTeeth: Array.from(missingTeeth) };
      await createPatientRecord(selectedPatient.id, reportName, 'doctor_examination', JSON.stringify(fullData));

      setSaveResult(`✅ Saved & Shared! Exam ${result.examinationId.slice(0, 8)}... — ${result.measurementCount} measurements shared with ${result.patientName}`);
    } catch (err: any) {
      setSaveResult(`❌ Save & Share failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [selectedPatient, chart, missingTeeth, teethConditions]);

  const { isConnected, isRecording, startExam, stopExam, connectionError, chatLog } = useGeminiLive(handleMeasurement, handleTogglePastRecord, handleSaveAndShare);

  // Auto-scroll chat
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTo({
        top: transcriptContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
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

  const handleGenerateReport = async () => {
    if (!selectedPatient) return;
    setIsGeneratingReport(true);
    setAiReportError(null);
    try {
      const reportText = await generateClinicalReport(chart, Array.from(missingTeeth), selectedPatient.id);
      setAiReport(reportText);
    } catch (err: any) {
      setAiReportError(err.message || 'Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // ── Print Report ───────────────────────────────────────────────────

  const handlePrint = () => {
    window.print();
  };

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
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || totalTeethCharted === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              totalTeethCharted === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
            }`}
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Report
              </>
            )}
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
            🖨️ Print View
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

      {/* ── Past Record Overlay ────────────────────────────────────── */}
      {showPastRecord && (
        <div className="fixed inset-y-0 right-0 w-[700px] bg-white/90 backdrop-blur-xl shadow-2xl border-l border-white/50 z-50 p-6 flex flex-col transform transition-transform duration-500 ease-out">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <History className="text-sky-500 w-5 h-5" />
              Past Examination
            </h3>
            <button onClick={() => setShowPastRecord(false)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingPastRecord ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
              </div>
            ) : !pastRecordData ? (
              <div className="text-center py-20 text-slate-400">
                <p>No completed past records found for this patient.</p>
              </div>
            ) : (() => {
              // ── Generate Past Teeth Conditions ──
              const pastChart: Record<number, any[]> = {};
              const pastMissingTeethSet = new Set<number>();
          
              pastRecordData.measurements.forEach((m: any) => {
                if (!pastChart[m.toothNumber]) pastChart[m.toothNumber] = [];
                pastChart[m.toothNumber].push(m);
                if (m.isMissing) pastMissingTeethSet.add(m.toothNumber);
              });
          
              const pastBleedingTeeth = Object.keys(pastChart).filter(t => pastChart[Number(t)].some(m => m.bleeding));
              const pastDeepPocketTeeth = Object.keys(pastChart).filter(t => pastChart[Number(t)].some(m => m.pocketDepth >= 4) && !pastBleedingTeeth.includes(t));
              const pastNormalTeeth = Object.keys(pastChart).filter(t => pastChart[Number(t)].some(m => m.pocketDepth > 0) && !pastBleedingTeeth.includes(t) && !pastDeepPocketTeeth.includes(t));
              const pastMissingTeethArr = Array.from(pastMissingTeethSet).map(String);
              const pastUnmeasuredTeeth = allUniversal.filter(t => 
                !pastBleedingTeeth.includes(t) && 
                !pastDeepPocketTeeth.includes(t) && 
                !pastNormalTeeth.includes(t) && 
                !pastMissingTeethArr.includes(t)
              );
          
              const pastTeethConditions = [
                { label: 'Uncharted', teeth: toFDI(pastUnmeasuredTeeth), outlineColor: '#cbd5e1', fillColor: '#ffffff' },
                { label: 'Bleeding (BOP)', teeth: toFDI(pastBleedingTeeth), outlineColor: '#ef4444', fillColor: '#fee2e2' },
                { label: 'Deep Pocket (≥4mm)', teeth: toFDI(pastDeepPocketTeeth), outlineColor: '#f59e0b', fillColor: '#fef3c7' },
                { label: 'Normal', teeth: toFDI(pastNormalTeeth), outlineColor: '#10b981', fillColor: '#d1fae5' },
                { label: 'Missing', teeth: toFDI(pastMissingTeethArr), outlineColor: '#9ca3af', fillColor: '#e5e7eb' },
              ];

              return (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(pastRecordData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    Provider: {pastRecordData.provider || 'Dr. Voice AI'}
                  </div>
                </div>

                {/* ── Past Odontogram ── */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <Odontogram
                    key={`past-${pastRecordData.id}`}
                    notation="Universal"
                    readOnly={true}
                    teethConditions={pastTeethConditions}
                    layout="square"
                    theme="light"
                  />
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Measurements</h4>
                  <div className="space-y-2">
                    {Object.values(
                      pastRecordData.measurements.reduce((acc: any, m: any) => {
                        if (!acc[m.toothNumber]) acc[m.toothNumber] = [];
                        acc[m.toothNumber].push(m);
                        return acc;
                      }, {})
                    ).map((toothMeasurements: any) => {
                      const tNum = toothMeasurements[0].toothNumber;
                      const isMissing = toothMeasurements.some((m: any) => m.isMissing);
                      
                      return (
                        <div key={tNum} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="font-bold text-slate-800 text-sm flex justify-between">
                            <span>Tooth #{tNum}</span>
                            {isMissing && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">MISSING</span>}
                          </div>
                          {!isMissing && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {toothMeasurements.filter((m: any) => !m.isMissing && (m.pocketDepth || m.bleeding || m.plaque || m.calculus || m.suppuration || m.mobility || m.furcation)).map((m: any) => (
                                <div key={m.id} className="text-xs flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-slate-100 flex-wrap gap-1">
                                  <span className="font-medium text-slate-500">{SITE_LABELS[m.site] || m.site}</span>
                                  <span className="flex flex-wrap items-center gap-1.5 font-bold justify-end flex-1">
                                    {m.pocketDepth && <span className={m.pocketDepth >= 4 ? 'text-amber-600' : 'text-slate-700'}>{m.pocketDepth}mm</span>}
                                    {m.bleeding && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Bleeding" />}
                                    {m.suppuration && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" title="Suppuration" />}
                                    {m.plaque && <span className="text-[9px] px-1 bg-amber-100 text-amber-700 rounded font-semibold">PLQ</span>}
                                    {m.calculus && <span className="text-[9px] px-1 bg-stone-200 text-stone-700 rounded font-semibold">CALC</span>}
                                    {m.mobility && <span className="text-[9px] px-1 bg-purple-100 text-purple-700 rounded font-semibold">MOB {m.mobility}</span>}
                                    {m.furcation && <span className="text-[9px] px-1 bg-blue-100 text-blue-700 rounded font-semibold">FURC {m.furcation}</span>}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
          </div>
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
              readOnly={false}
              singleSelect={true}
              teethConditions={teethConditions}
              layout="square"
              theme="light"
              onChange={(selected) => {
                if (selected && selected.length > 0) {
                  const toothNum = Number(selected[0].notations?.universal || selected[0].id);
                  setTimeout(() => {
                    setSelectedTooth((prev) => prev !== toothNum ? toothNum : prev);
                  }, 0);
                }
              }}
              tooltip={{
                content: (tooth: any) => {
                  const tId = Number(tooth.notations?.universal || tooth.id);
                  const tData = chart[tId] || {};
                  
                  let hasMobility: number | null = null;
                  let hasPlaque = false;
                  let hasCalculus = false;
                  let hasSuppuration = false;
                  let maxFurcation: number | null = null;
                  const isToothMissing = missingTeeth.has(tId);

                  Object.values(tData).forEach((site: any) => {
                    if (site.mobility !== undefined) hasMobility = site.mobility;
                    if (site.plaque) hasPlaque = true;
                    if (site.calculus) hasCalculus = true;
                    if (site.suppuration) hasSuppuration = true;
                    if (site.furcation !== undefined) {
                      maxFurcation = maxFurcation === null ? site.furcation : Math.max(maxFurcation, site.furcation);
                    }
                  });

                  return (
                    <div className="p-1.5 text-left font-sans min-w-[120px]">
                      <div className="font-bold text-sm text-white border-b border-slate-700/50 pb-1 mb-1">
                        Tooth #{tId}
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium mb-1">
                        {tooth.type}
                      </div>
                      {isToothMissing && <div className="text-xs font-bold text-gray-400 mt-1 uppercase">Missing</div>}
                      {!isToothMissing && (hasMobility !== null || hasPlaque || hasCalculus || hasSuppuration || maxFurcation !== null) && (
                        <div className="flex flex-col gap-0.5 mt-2">
                          {hasMobility !== null && <div className="text-[11px] text-purple-300 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"/>Mobility: {hasMobility}</div>}
                          {hasPlaque && <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>Plaque</div>}
                          {hasCalculus && <div className="text-[11px] text-stone-300 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-stone-400"/>Calculus</div>}
                          {hasSuppuration && <div className="text-[11px] text-yellow-300 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"/>Suppuration</div>}
                          {maxFurcation !== null && <div className="text-[11px] text-blue-300 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"/>Furcation: {maxFurcation}</div>}
                        </div>
                      )}
                    </div>
                  );
                }
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
              <>
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
                      <div className="flex flex-wrap justify-center gap-1 mt-2">
                        {hasBleeding && <span className="text-[9px] px-1 bg-red-100 text-red-700 rounded font-bold">BOP</span>}
                        {rec !== undefined && <span className="text-[9px] px-1 bg-gray-200 text-gray-700 rounded font-bold">R:{rec}</span>}
                        {data?.suppuration && <span className="text-[9px] px-1 bg-yellow-100 text-yellow-700 rounded font-bold">PUS</span>}
                        {data?.plaque && <span className="text-[9px] px-1 bg-amber-100 text-amber-700 rounded font-bold">PLQ</span>}
                        {data?.calculus && <span className="text-[9px] px-1 bg-stone-200 text-stone-700 rounded font-bold">CALC</span>}
                        {data?.furcation !== undefined && <span className="text-[9px] px-1 bg-blue-100 text-blue-700 rounded font-bold">FURC {data.furcation}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Tooth-Level Findings */}
              {(() => {
                let mob: number | null = null;
                Object.values(selectedToothData || {}).forEach((s: any) => {
                  if (s.mobility !== undefined) mob = s.mobility;
                });
                
                if (mob === null) return null;
                
                return (
                  <div className="mt-4 p-3 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tooth-Level Findings</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md font-extrabold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"/>
                        Mobility Class {mob}
                      </span>
                    </div>
                  </div>
                );
              })()}
              </>
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

          <div ref={transcriptContainerRef} className="flex-1 p-3 overflow-y-auto flex flex-col gap-2">
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
          </div>
        </div>
      </div>

      {/* ── AI Report (Inline for Printing) ─────────────────────────── */}
      {(aiReport || aiReportError) && (
        <div className="mt-6 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/50 relative overflow-hidden print:hidden">
          <button 
            onClick={() => { setAiReport(null); setAiReportError(null); }}
            className="absolute top-4 right-4 p-2 hover:bg-white/80 rounded-xl transition-colors text-indigo-400 hover:text-indigo-600 print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900">AI Clinical Narrative</h3>
              <p className="text-[11px] text-indigo-500 font-medium mt-0.5">Auto-generated from chart data</p>
            </div>
          </div>
          
          {aiReportError ? (
            <div className="text-center py-4">
              <p className="text-red-600 font-medium">Generation Failed</p>
              <p className="text-sm text-indigo-400 mt-2">{aiReportError}</p>
            </div>
          ) : aiReport ? (
            <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-indigo-950">
              {aiReport.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('## ', '')}</h3>;
                if (line.startsWith('### ')) return <h4 key={i} className="text-base font-semibold mt-3 mb-1">{line.replace('### ', '')}</h4>;
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
                if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 mb-1 text-slate-700">{line.replace(/^[-*] /, '')}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="text-slate-700 mb-1">{line}</p>;
              })}
            </div>
          ) : null}

          <div className="mt-6 pt-4 border-t border-indigo-100/50 flex gap-2 items-start text-xs text-indigo-600/80 font-medium">
            <span className="text-base leading-none">⚠️</span>
            <p>
              <strong>Disclaimer:</strong> This clinical narrative was generated automatically by Artificial Intelligence (GPT-4o) based on voice-captured raw data. 
              AI can make mistakes. Please verify all findings against the raw detailed clinical measurements in the table below before making clinical decisions.
            </p>
          </div>
        </div>
      )}

      {/* ── Patient-Friendly Print Summary ─────────────────────────── */}
      <div className="hidden print:block mt-8 text-black">
        <h3 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">Patient Clinical Summary</h3>
        <div className="space-y-4">
          {totalTeethCharted === 0 && (
            <p className="italic text-gray-500">No teeth charted.</p>
          )}
          {Object.entries(chart).map(([toothNum, sites]) => {
            const hasData = Object.keys(sites).length > 0;
            const isMissing = missingTeeth.has(Number(toothNum));
            
            if (isMissing) {
              return (
                <div key={toothNum} className="p-3 border border-gray-300 rounded-lg">
                  <span className="font-bold text-lg">Tooth {toothNum}:</span> <span className="text-gray-700 font-medium ml-2">Missing</span>
                </div>
              );
            }
            
            if (!hasData) return null;
            
            const siteSummaries = [];
            let mobilitySummary = null;
            
            for (const [site, data] of Object.entries(sites)) {
              if (data.mobility !== undefined) {
                mobilitySummary = `Mobility Class ${data.mobility}`;
              }
              
              const findings = [];
              if (data.pocket_depth) findings.push(`${data.pocket_depth}mm pocket`);
              if (data.bleeding) findings.push('Bleeding on probing');
              if (data.plaque) findings.push('Plaque');
              if (data.calculus) findings.push('Calculus (Tartar)');
              if (data.suppuration) findings.push('Suppuration (Pus)');
              if (data.furcation !== undefined) findings.push(`Furcation Class ${data.furcation}`);
              if (data.recession !== undefined) findings.push(`Recession ${data.recession}mm`);
              
              if (findings.length > 0) {
                const fullSiteName = site.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
                siteSummaries.push(
                  <div key={site} className="ml-4 mt-1.5 text-sm">
                    <span className="font-semibold underline decoration-gray-300">{fullSiteName}:</span> <span className="ml-1">{findings.join(', ')}</span>
                  </div>
                );
              }
            }
            
            if (siteSummaries.length === 0 && !mobilitySummary) return null;
            
            return (
              <div key={toothNum} className="p-4 border border-gray-300 rounded-lg break-inside-avoid">
                <div className="font-bold text-lg mb-2">Tooth {toothNum}</div>
                {mobilitySummary && <div className="ml-4 mb-2 font-semibold text-gray-800">{mobilitySummary}</div>}
                {siteSummaries}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom: Full Clinical Data Grid ─────────────────────────── */}
      <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:hidden">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Detailed Clinical Measurements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-2 font-semibold rounded-tl-lg">Tooth</th>
                  {ALL_SITES.map(site => (
                    <th key={site} className="text-center p-2 font-semibold">{SITE_LABELS[site]}</th>
                  ))}
                  <th className="text-center p-2 font-semibold">Mobility</th>
                  <th className="text-center p-2 font-semibold rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({length: 32}, (_, i) => String(i + 1)).map(toothNumStr => {
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
                        const hasData = pd !== undefined || siteData?.mobility !== undefined || siteData?.plaque !== undefined || siteData?.calculus !== undefined || siteData?.suppuration !== undefined || siteData?.furcation !== undefined;

                        return (
                          <td key={site} className="p-2 text-center align-top border-x border-slate-50/50">
                            {hasData ? (
                              <div className="flex flex-col items-center justify-center min-h-[40px] gap-1">
                                {(pd !== undefined || hasBleeding || siteData?.suppuration) && (
                                  <span className={`inline-flex items-center gap-1 font-semibold ${
                                    hasBleeding ? 'text-red-600' :
                                    pd !== undefined && pd >= 4 ? 'text-amber-600' :
                                    pd !== undefined ? 'text-slate-700' : 'text-slate-400'
                                  }`}>
                                    {pd !== undefined ? pd : ''}
                                    {hasBleeding && <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" title="BOP" />}
                                    {siteData?.suppuration && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" title="Suppuration" />}
                                  </span>
                                )}
                                <div className="flex flex-wrap justify-center gap-0.5 max-w-[60px]">
                                  {siteData?.plaque && <span className="text-[8px] px-1 bg-amber-100 text-amber-700 rounded font-bold">PLQ</span>}
                                  {siteData?.calculus && <span className="text-[8px] px-1 bg-stone-200 text-stone-700 rounded font-bold">CALC</span>}
                                  {siteData?.furcation !== undefined && <span className="text-[8px] px-1 bg-blue-100 text-blue-700 rounded font-bold">FURC {siteData.furcation}</span>}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-200 flex items-center justify-center min-h-[40px]">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center align-middle border-x border-slate-50/50 bg-slate-50/30">
                        {(() => {
                           let mob: number | null = null;
                           Object.values(toothData || {}).forEach((s: any) => {
                             if (s.mobility !== undefined) mob = s.mobility;
                           });
                           return mob !== null ? (
                             <span className="text-[10px] bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md font-bold">Class {mob}</span>
                           ) : (
                             <span className="text-slate-200 flex items-center justify-center min-h-[40px]">—</span>
                           );
                        })()}
                      </td>
                      <td className="p-2 text-center align-top border-x border-slate-50/50">
                        <div className="flex flex-col items-center justify-center min-h-[40px] gap-1">
                          {isMissing ? (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">MISSING</span>
                          ) : (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">PRESENT</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
