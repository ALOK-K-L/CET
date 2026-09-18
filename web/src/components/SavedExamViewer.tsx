'use client';

import { useState } from 'react';
import Odontogram from 'react-odontogram';
import Link from 'next/link';

type SiteData = {
  pocket_depth?: number | null;
  recession?: number | null;
  bleeding?: boolean;
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

export default function SavedExamViewer({ 
  chart, 
  missingTeeth,
  examDetails 
}: { 
  chart: ChartState; 
  missingTeeth: Set<number>;
  examDetails: { date: string, patientName: string, provider: string }
}) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

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

  const selectedToothData = selectedTooth ? chart[selectedTooth] : null;
  const isSelectedMissing = selectedTooth ? missingTeeth.has(selectedTooth) : false;

  const totalTeethCharted = Object.keys(chart).length;
  const totalSitesCharted = Object.values(chart).reduce((sum, sites) => sum + Object.keys(sites).length, 0);
  const totalBleeding = Object.values(chart).reduce((sum, sites) => sum + Object.values(sites).filter(s => s.bleeding).length, 0);

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/database"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors print:hidden"
          >
            ←
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Examination Record
            </h2>
            <p className="text-slate-500 text-sm">
              {examDetails.patientName} • {examDetails.provider} • {examDetails.date}
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-slate-700 text-white hover:bg-slate-800 print:hidden"
        >
          🖨️ Print / Download Report
        </button>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <Odontogram
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
                content: (tooth: any) => (
                  <div className="p-1 text-center font-sans">
                    <div className="font-bold text-sm text-white">
                      Tooth #{tooth.notations?.universal || tooth.id}
                    </div>
                  </div>
                )
              }}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">
                {selectedTooth ? `Tooth ${selectedTooth} — Detail` : 'Select a tooth in the table below to view details'}
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
                Click a row below to see tooth details
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Patient-Friendly Print Summary ─────────────────────────── */}
      <div className="hidden print:block mt-8 text-black">
        <h3 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">Patient Clinical Summary</h3>
        <div className="space-y-4">
          {totalTeethCharted === 0 && (
            <p className="italic text-gray-500">No teeth charted.</p>
          )}
          {Object.entries(chart).sort((a, b) => Number(a[0]) - Number(b[0])).map(([toothNumStr, sites]) => {
            const toothNum = Number(toothNumStr);
            const hasData = Object.keys(sites).length > 0;
            const isMissing = missingTeeth.has(toothNum);
            
            if (isMissing) {
              return (
                <div key={toothNumStr} className="p-3 border border-gray-300 rounded-lg">
                  <span className="font-bold text-lg">Tooth {toothNum}:</span> <span className="text-gray-700 font-medium ml-2">Missing</span>
                </div>
              );
            }
            
            if (!hasData) return null;
            
            const siteSummaries = [];
            let mobilitySummary = null;
            
            for (const [site, data] of Object.entries(sites) as [string, any][]) {
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
              if (data.recession !== undefined && data.recession !== null) findings.push(`Recession ${data.recession}mm`);
              
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
              <div key={toothNumStr} className="p-4 border border-gray-300 rounded-lg break-inside-avoid">
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
                        return (
                          <td key={site} className="p-2 text-center">
                            {pd !== undefined && pd !== null ? (
                              <span className={`inline-flex items-center gap-1 font-semibold ${
                                hasBleeding ? 'text-red-600' :
                                pd >= 4 ? 'text-amber-600' :
                                'text-slate-700'
                              }`}>
                                {pd}
                                {hasBleeding && <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />}
                              </span>
                            ) : (
                              <span className="text-slate-200">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center">
                        {isMissing ? (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">MISSING</span>
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
    </div>
  );
}
