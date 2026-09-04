import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search, LogOut, Calendar, MapPin, Clock, User,
  AlertCircle, ChevronLeft, ChevronRight, Briefcase
} from 'lucide-react';
import { getJobs } from '../api/jobs';
import { useAuth } from '../context/AuthContext';

export default function MyJobsPage() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('active');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-jobs', search, page],
    queryFn: () => getJobs({ ...(search ? { search } : {}), page }),
    keepPreviousData: true,
  });

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      on_site: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      en_route: 'bg-amber-50 text-amber-700 border-amber-200',
      assigned: 'bg-blue-50 text-blue-700 border-blue-200',
      pending: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${styles[status] || styles.pending}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800 font-semibold',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-slate-100 text-slate-700',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs capitalize ${styles[priority] || styles.low}`}>
        {priority}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const allJobs = data?.jobs || [];
  const activeJobs = allJobs.filter((j) => j.status !== 'completed');
  const completedJobs = allJobs.filter((j) => j.status === 'completed');
  const visibleJobs = tab === 'completed' ? completedJobs : activeJobs;

  const totalPages = Math.ceil((data?.total || 0) / (data?.pageSize || 20));

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">Assigned Jobs</h1>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, location, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
          {data && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              {data.total} {data.total === 1 ? 'Job' : 'Jobs'} Total
            </span>
          )}
        </div>

        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'active'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active ({activeJobs.length})
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'completed'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed ({completedJobs.length})
          </button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-5 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/4"></div>
              </div>
            ))
          ) : isError ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              Failed to load assigned jobs.
            </div>
          ) : visibleJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
              No {tab} jobs found{search ? ' matching your search' : ''}.
            </div>
          ) : (
            visibleJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {job.customerName}
                    </h2>
                    {getStatusBadge(job.status)}
                  </div>
                  <div>{getPriorityBadge(job.priority)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{job.siteAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatDate(job.scheduledDate)} at {formatTime(job.startTime)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est. {job.estimatedDurationMinutes} mins</span>
                  </div>

                  {job.assignments?.length > 0 && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {job.assignments.length === 1
                          ? job.assignments[0].technician.email.split('@')[0]
                          : `${job.assignments.length} Technicians Assigned`}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-500 shadow-sm">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}