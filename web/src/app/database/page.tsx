import { getRecentExaminations } from '@/app/actions';
import Link from 'next/link';

export default async function DatabaseHistoryPage() {
  const recentExams = await getRecentExaminations();

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/doctor"
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              ←
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Database Records</h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md uppercase tracking-wider">PostgreSQL</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">View all saved clinical charting sessions.</p>
            </div>
          </div>
        </div>

        {/* Database Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {recentExams.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🗄️</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Records Found</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                There are no examinations saved in the database yet. Return to the Charting Dashboard and complete an exam to see it here.
              </p>
              <Link 
                href="/doctor/charting"
                className="inline-block mt-6 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors"
              >
                Go to Charting Dashboard
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date / Time</th>
                    <th className="px-6 py-4 font-semibold">Patient</th>
                    <th className="px-6 py-4 font-semibold">Provider</th>
                    <th className="px-6 py-4 font-semibold text-center">Measurements Saved</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentExams.map((exam) => (
                    <tr 
                      key={exam.id} 
                      className="hover:bg-slate-50 transition-colors relative group"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        <Link href={`/database/${exam.id}`} className="absolute inset-0 z-10">
                          <span className="sr-only">View Record</span>
                        </Link>
                        {new Date(exam.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {exam.patient.firstName} {exam.patient.lastName}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {exam.provider || 'System'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full relative z-20">
                          {exam._count.measurements} data points
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider relative z-20">
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors relative z-0">
                          View Record
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
