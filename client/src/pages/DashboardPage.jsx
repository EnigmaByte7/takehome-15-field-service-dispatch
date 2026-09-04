import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, CheckCircle2, AlertTriangle, UserX, ArrowLeft, 
  BarChart3, Users, Clock, RefreshCw, Layers
} from 'lucide-react';
import { getDashboardSummary, getCompletedPerDay } from '../api/dashboard';

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    blue: {
      bg: 'bg-blue-50/80 hover:bg-blue-50',
      iconBg: 'bg-blue-600',
      text: 'text-blue-700',
      border: 'border-blue-100',
      accent: 'bg-blue-600',
    },
    green: {
      bg: 'bg-emerald-50/80 hover:bg-emerald-50',
      iconBg: 'bg-emerald-600',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      accent: 'bg-emerald-600',
    },
    red: {
      bg: 'bg-rose-50/80 hover:bg-rose-50',
      iconBg: 'bg-rose-600',
      text: 'text-rose-700',
      border: 'border-rose-100',
      accent: 'bg-rose-600',
    },
    gray: {
      bg: 'bg-slate-50 hover:bg-slate-100/80',
      iconBg: 'bg-slate-700',
      text: 'text-slate-700',
      border: 'border-slate-200/80',
      accent: 'bg-slate-700',
    },
  };

  const style = tones[tone] || tones.gray;

  return (
    <div className={`bg-white border ${style.border} rounded-2xl p-5 shadow-sm transition-all hover:shadow-md relative overflow-hidden group`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.accent}`} />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{value ?? 0}</div>
        </div>
        <div className={`${style.iconBg} p-3 rounded-xl text-white shadow-sm transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: summary, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  const { data: chart } = useQuery({
    queryKey: ['dashboard-completed-per-day'],
    queryFn: getCompletedPerDay,
  });

  const maxCount = chart ? Math.max(1, ...chart.map((d) => d.count)) : 1;
  const totalByStatus = summary?.byStatus 
    ? Object.values(summary.byStatus).reduce((a, b) => a + b, 0) 
    : 0;

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Operations Dashboard</h1>
              <p className="text-xs text-slate-500">Real-time job dispatch & technician metrics</p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse flex flex-col justify-between">
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto text-rose-500" />
            <p className="font-semibold text-sm">Failed to load dashboard metrics.</p>
            <button 
              onClick={() => refetch()} 
              className="text-xs underline font-medium hover:text-rose-900"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Calendar} label="Scheduled Today" value={summary?.scheduledToday} tone="blue" />
              <StatCard icon={CheckCircle2} label="Completed Today" value={summary?.completedToday} tone="green" />
              <StatCard icon={AlertTriangle} label="Running Late" value={summary?.lateCount} tone="red" />
              <StatCard icon={UserX} label="Unassigned Jobs" value={summary?.unassigned} tone="gray" />
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" /> Jobs by Status
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">Total: {totalByStatus}</span>
                </div>

                <div className="space-y-3">
                  {summary?.byStatus && Object.entries(summary.byStatus).map(([status, count]) => {
                    const percentage = totalByStatus > 0 ? Math.round((count / totalByStatus) * 100) : 0;
                    return (
                      <div key={status} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-700 capitalize">{status.replace('_', ' ')}</span>
                          <span className="text-slate-900 font-bold">{count} <span className="text-slate-400 font-normal">({percentage}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" /> Active Workload by Technician
                  </h2>
                </div>

                <div className="space-y-2">
                  {!summary?.byTechnician || summary.byTechnician.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400 italic">
                      No active assignments currently.
                    </div>
                  ) : (
                    summary.byTechnician.map((t) => (
                      <div key={t.email} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {t.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-slate-800 truncate">{t.email}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 shadow-2xs">
                          {t.count} {t.count === 1 ? 'Job' : 'Jobs'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>


            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" /> Completion Velocity
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Completed jobs per day over the last 14 days</p>
                </div>
              </div>

              {!chart || chart.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-slate-400 italic">
                  No completion historical data available.
                </div>
              ) : (
                <div className="pt-6 pb-2">
                  <div className="flex items-end gap-2 sm:gap-3 h-48 px-2">
                    {chart.map((d) => {
                      const heightPercent = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg whitespace-nowrap">
                            {d.count} Completed
                          </div>

                          <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden p-0.5">
                            <div
                              className={`w-full rounded-t-md transition-all duration-500 ${
                                d.count > 0 ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-transparent'
                              }`}
                              style={{ 
                                height: `${heightPercent}%`, 
                                minHeight: d.count > 0 ? '6px' : '0px' 
                              }}
                            />
                          </div>

                          <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-900 transition-colors mt-3 text-center truncate w-full">
                            {formatDateLabel(d.date)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}