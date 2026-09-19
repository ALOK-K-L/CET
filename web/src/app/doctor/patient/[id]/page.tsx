import { db } from '@/lib/db';
import Link from 'next/link';
import DoctorUploadForm from '@/components/DoctorUploadForm';
import PatientRecordsViewer from '@/components/PatientRecordsViewer';

export default async function PatientDataPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ doctorId?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const patientId = resolvedParams.id;
  const doctorId = resolvedSearchParams.doctorId;

  // Verify access level if doctorId is provided
  let accessLog = null;
  if (doctorId) {
    accessLog = await db.patientRecord.findFirst({
      where: {
        patientId,
        content: doctorId,
        type: 'access_log'
      }
    });
  }

  // Construct query for records
  const recordsQuery: any = {
    orderBy: { createdAt: 'desc' }
  };

  // Fetch patient details and their records
  const patient = await db.patient.findUnique({
    where: { id: patientId },
    include: {
      records: recordsQuery
    }
  });

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Patient Not Found</h2>
          <Link href="/doctor" className="mt-4 inline-block text-blue-600 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Filter out the 'share_code' and 'access_log' records
  const visibleRecords = patient.records.filter(r => !['share_code', 'access_log'].includes(r.type));

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/doctor/patients" className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="font-light tracking-wide text-sm">Patient Roster</span>
        </Link>
        <h1 className="text-sm font-light text-slate-800 tracking-wide">
          {patient.firstName} {patient.lastName}
        </h1>
      </header>

      <div className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-light text-slate-800 mb-2 tracking-tight">Patient Profile.</h2>
          <p className="text-slate-400 font-light text-sm">Patient ID: <span className="font-mono">{patient.id}</span></p>
        </div>



        {/* Doctor Upload Form */}
        <div className="mb-8">
          <DoctorUploadForm patientId={patientId} />
        </div>

        <PatientRecordsViewer records={visibleRecords as any} />

      </div>
    </main>
  );
}
