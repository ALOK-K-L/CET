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
        type: { in: ['access_log', 'access_log_snapshot'] }
      }
    });
  }

  // Construct query for records based on access type
  const recordsQuery: any = {
    orderBy: { createdAt: 'desc' }
  };

  if (accessLog?.type === 'access_log_snapshot') {
    // If snapshot access, only fetch records created at or before the access was granted
    recordsQuery.where = {
      createdAt: { lte: accessLog.createdAt }
    };
  }

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
  const visibleRecords = patient.records.filter(r => !['share_code', 'access_log', 'access_log_snapshot'].includes(r.type));

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

        {accessLog?.type === 'access_log_snapshot' && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-amber-800 text-lg">Snapshot Access Mode</h3>
              <p className="text-amber-700 mt-1">
                The patient has granted you <strong>Snapshot Access</strong>. You are only viewing records uploaded prior to <strong>{new Date(accessLog.createdAt).toLocaleString()}</strong>. Any records uploaded by the patient after this date are hidden. Note: You can still add new records to their profile.
              </p>
            </div>
          </div>
        )}

        {/* Doctor Upload Form */}
        <div className="mb-8">
          <DoctorUploadForm patientId={patientId} />
        </div>

        <PatientRecordsViewer records={visibleRecords as any} />

      </div>
    </main>
  );
}
