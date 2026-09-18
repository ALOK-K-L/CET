import { getExaminationById } from '@/app/actions';
import { notFound } from 'next/navigation';
import SavedExamViewer from '@/components/SavedExamViewer';

export default async function SavedExamPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const exam = await getExaminationById(id);

  if (!exam) {
    notFound();
  }

  const chart: Record<number, Record<string, { pocket_depth?: number | null; recession?: number | null; bleeding?: boolean }>> = {};
  const missingTeeth = new Set<number>();

  for (const m of exam.measurements) {
    if (m.isMissing) {
      missingTeeth.add(m.toothNumber);
    } else {
      if (!chart[m.toothNumber]) {
        chart[m.toothNumber] = {};
      }
      chart[m.toothNumber][m.site] = {
        pocket_depth: m.pocketDepth,
        recession: m.recession,
        bleeding: m.bleeding,
      };
    }
  }

  const examDetails = {
    date: new Date(exam.createdAt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    }),
    patientName: `${exam.patient.firstName} ${exam.patient.lastName}`,
    provider: exam.provider || 'System',
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SavedExamViewer 
          chart={chart} 
          missingTeeth={missingTeeth} 
          examDetails={examDetails} 
        />
      </div>
    </main>
  );
}
