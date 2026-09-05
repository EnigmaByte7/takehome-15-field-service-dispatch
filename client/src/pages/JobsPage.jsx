import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search, Plus, LogOut, Calendar, MapPin, Clock, User,
  AlertCircle, ChevronLeft, ChevronRight, X, ArrowUpDown, RotateCcw,
  LayoutDashboard, Download
} from 'lucide-react';
import { getJobs, createJob, exportDaySheet, bulkAssignJobs } from '../api/jobs';
import { getTechnicians } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { downloadCsv } from '../lib/download';
import AlertBell from '../components/AlertBell';

const STATUS_OPTIONS = ['unassigned', 'assigned', 'en_route', 'on_site', 'completed'];
const SORT_OPTIONS = [
  { value: 'scheduledDate', label: 'Scheduled Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
];

export default function JobsPage() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [date, setDate] = useState('');
  const [sortBy, setSortBy] = useState('scheduledDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [exportDate, setExportDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isExporting, setIsExporting] = useState(false);

  const [selectedJobIds, setSelectedJobIds] = useState(new Set());
  const [bulkTechnicianId, setBulkTechnicianId] = useState('');
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);

  const filters = { search, status, technicianId, date, sortBy, sortOrder, page };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () =>
      getJobs({
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(technicianId ? { technicianId } : {}),
        ...(date ? { date } : {}),
        sortBy,
        sortOrder,
        page,
      }),
    keepPreviousData: true,
  });

  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: getTechnicians,
  });

  function updateFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  function resetFilters() {
    setSearch('');
    setStatus('');
    setTechnicianId('');
    setDate('');
    setSortBy('scheduledDate');
    setSortOrder('asc');
    setPage(1);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await createJob({
        customerName: form.get('customerName'),
        siteAddress: form.get('siteAddress'),
        description: form.get('description'),
        priority: form.get('priority'),
        scheduledDate: form.get('scheduledDate'),
        startTime: `${form.get('scheduledDate')}T${form.get('startTime')}:00`,
        estimatedDurationMinutes: Number(form.get('duration')),
      });
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (err) {
      console.error('Failed to create job', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const csv = await exportDaySheet(exportDate);
      downloadCsv(`dispatch-${exportDate}.csv`, csv);
    } catch (err) {
      console.error('Failed to export day sheet', err);
    } finally {
      setIsExporting(false);
    }
  }

  function toggleSelect(jobId) {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }

  function toggleSelectAll(unassignedOnPage, allSelected) {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        unassignedOnPage.forEach((j) => next.delete(j.id));
      } else {
        unassignedOnPage.forEach((j) => next.add(j.id));
      }
      return next;
    });
  }

  async function handleBulkAssign() {
    if (!bulkTechnicianId || selectedJobIds.size === 0) return;
    setIsBulkSubmitting(true);
    try {
      const { results } = await bulkAssignJobs(Array.from(selectedJobIds), bulkTechnicianId);
      setBulkResults(results);
      setSelectedJobIds(new Set());
      setBulkTechnicianId('');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (err) {
      console.error('Bulk assign failed', err);
    } finally {
      setIsBulkSubmitting(false);
    }
  }

  const getStatusBadge = (jobStatus) => {
    const styles = {
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      on_site: 'bg-amber-50 text-amber-700 border-amber-200',
      en_route: 'bg-amber-50 text-amber-700 border-amber-200',
      assigned: 'bg-blue-50 text-blue-700 border-blue-200',
      unassigned: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[jobStatus] || styles.unassigned}`}>
        {jobStatus?.replace('_', ' ')}
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

  const totalPages = Math.ceil((data?.total || 0) / (data?.pageSize || 20));
  const hasActiveFilters = search || status || technicianId || date;

  const unassignedOnPage = data?.jobs?.filter((j) => j.status === 'unassigned') ?? [];
  const allSelected = unassignedOnPage.length > 0 && unassignedOnPage.every((j) => selectedJobIds.has(j.id));

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dispatch Queue</h1>
            {data && (
              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
                {data.total} Jobs
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1">
              <input
                type="date"
                value={exportDate}
                onChange={(e) => setExportDate(e.target.value)}
                className="text-sm px-1 py-1 outline-none text-slate-700"
              />
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> {isExporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
            <AlertBell />
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Job
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 pb-24">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer or address..."
                value={search}
                onChange={(e) => updateFilter(setSearch)(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={status}
              onChange={(e) => updateFilter(setStatus)(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={technicianId}
              onChange={(e) => updateFilter(setTechnicianId)(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
            >
              <option value="">All technicians</option>
              {technicians?.map((t) => (
                <option key={t.id} value={t.id}>{t.email}</option>
              ))}
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => updateFilter(setDate)(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 font-medium">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white text-slate-700"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="inline-flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset filters
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-8">
                    {unassignedOnPage.length > 0 && (
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => toggleSelectAll(unassignedOnPage, allSelected)}
                        className="rounded border-slate-300"
                      />
                    )}
                  </th>
                  <th className="py-3 px-4">Customer & Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Scheduled Window</th>
                  <th className="py-3 px-4">Technician(s)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4"></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-slate-100 rounded w-1/2"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-10 ml-auto"></div></td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      Failed to load dispatch queue.
                    </td>
                  </tr>
                ) : data?.jobs?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      No jobs found matching your filters.
                    </td>
                  </tr>
                ) : (
                  data?.jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3.5 px-4">
                        {job.status === 'unassigned' ? (
                          <input
                            type="checkbox"
                            checked={selectedJobIds.has(job.id)}
                            onChange={() => toggleSelect(job.id)}
                            className="rounded border-slate-300"
                          />
                        ) : (
                          <span className="block w-4 h-4" />
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link to={`/jobs/${job.id}`} className="font-semibold text-slate-900 hover:text-blue-600">
                          {job.customerName}
                        </Link>
                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-xs">{job.siteAddress}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getPriorityBadge(job.priority)}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(job.status)}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(job.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {job.estimatedDurationMinutes} mins
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {job.assignments?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {job.assignments.map((a) => (
                              <span key={a.technician.id} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                                <User className="w-3 h-3 text-slate-400" />
                                {a.technician.email.split('@')[0]}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 border rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 border rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedJobIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-xl shadow-xl px-5 py-3 flex items-center gap-3">
          <span className="text-sm font-medium whitespace-nowrap">{selectedJobIds.size} selected</span>
          <select
            value={bulkTechnicianId}
            onChange={(e) => setBulkTechnicianId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none"
          >
            <option value="">Choose technician...</option>
            {technicians?.map((t) => (
              <option key={t.id} value={t.id}>{t.email}</option>
            ))}
          </select>
          <button
            onClick={handleBulkAssign}
            disabled={!bulkTechnicianId || isBulkSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap"
          >
            {isBulkSubmitting ? 'Assigning...' : 'Bulk Assign'}
          </button>
          <button
            onClick={() => setSelectedJobIds(new Set())}
            className="text-slate-400 hover:text-white text-sm"
          >
            Clear
          </button>
        </div>
      )}

      {bulkResults && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Bulk Assign Results</h2>
              <button
                onClick={() => setBulkResults(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {bulkResults.map((r) => {
                const job = data?.jobs.find((j) => j.id === r.jobId);
                return (
                  <div
                    key={r.jobId}
                    className={`p-3 rounded-lg border text-sm ${r.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}
                  >
                    <div className="font-medium">{job?.customerName || r.jobId}</div>
                    {!r.success && <div className="text-xs mt-0.5">{r.reason}</div>}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setBulkResults(null)}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white rounded-lg py-2 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl relative border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-900">Create New Job</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Customer Name</label>
                <input name="customerName" required placeholder="Jane Doe" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Site Address</label>
                <input name="siteAddress" required placeholder="123 Main St, Suite 400" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                <textarea name="description" required rows="2" placeholder="Provide job details..." className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Priority</label>
                  <select name="priority" defaultValue="medium" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Duration (Mins)</label>
                  <input name="duration" type="number" defaultValue="60" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Scheduled Date</label>
                  <input name="scheduledDate" type="date" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Start Time</label>
                  <input name="startTime" type="time" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}