import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Calendar, Clock, MapPin, User, AlertCircle,
  CheckCircle2, UserPlus, Package, Activity,
  ChevronRight, Play, Pencil, X
} from 'lucide-react';
import { getJob, getTimeline, transitionStatus, addPart, assignTechnician, updateJob } from '../api/jobs';
import { getTechnicians } from '../api/users';
import { useAuth } from '../context/AuthContext';
import {
 Archive, ArchiveRestore
} from 'lucide-react';
import {archiveJob, restoreJob } from '../api/jobs';

const NEXT_STATUS = {
  assigned: 'en_route',
  en_route: 'on_site',
  on_site: 'completed',
};

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().slice(0, 10);
}

function toTimeInputValue(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().slice(11, 16);
}

export default function JobDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [partName, setPartName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [technicianId, setTechnicianId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id),
  });

  const { data: timeline } = useQuery({
    queryKey: ['timeline', id],
    queryFn: () => getTimeline(id),
  });

  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: getTechnicians,
    enabled: user?.role === 'dispatcher',
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['job', id] });
    queryClient.invalidateQueries({ queryKey: ['timeline', id] });
  }

  async function handleAdvance() {
    if (!job) return;
    const next = NEXT_STATUS[job.status];
    if (!next) return;
    setError('');
    setIsSubmitting(true);
    try {
      await transitionStatus(id, next, next === 'completed' ? note : undefined);
      refresh();
    } catch (err) {
      setError(err.message || 'Failed to update job status');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchiveToggle() {
    setError('');
    setIsSubmitting(true);
    try {
      if (job.archivedAt) {
        await restoreJob(id);
      } else {
        await archiveJob(id);
      }
      refresh();
    } catch (err) {
      setError(err.message || 'Failed to update archive status');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddPart(e) {
    e?.preventDefault();
    if (!partName.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      await addPart(id, partName, quantity);
      setPartName('');
      setQuantity(1);
      refresh();
    } catch (err) {
      setError(err.message || 'Failed to record part usage');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAssign() {
    if (!technicianId) return;
    setError('');
    setIsSubmitting(true);
    try {
      await assignTechnician(id, technicianId);
      setTechnicianId('');
      refresh();
    } catch (err) {
      setError(err.message || 'Failed to assign technician');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditError('');
    setIsSavingEdit(true);
    const form = new FormData(e.currentTarget);
    const scheduledDate = form.get('scheduledDate');
    const startTime = form.get('startTime');
    try {
      await updateJob(id, {
        customerName: form.get('customerName'),
        siteAddress: form.get('siteAddress'),
        description: form.get('description'),
        priority: form.get('priority'),
        scheduledDate,
        startTime: `${scheduledDate}T${startTime}:00`,
        estimatedDurationMinutes: Number(form.get('duration')),
      });
      setShowEditModal(false);
      refresh();
    } catch (err) {
      setEditError(err.message || 'Failed to update job');
    } finally {
      setIsSavingEdit(false);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      on_site: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      en_route: 'bg-amber-50 text-amber-700 border-amber-200',
      assigned: 'bg-blue-50 text-blue-700 border-blue-200',
      pending: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${styles[status] || styles.pending}`}>
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
      <span className={`inline-block px-2.5 py-0.5 rounded text-xs capitalize ${styles[priority] || styles.low}`}>
        {priority}
      </span>
    );
  };

  if (jobLoading || !job) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center text-slate-500 space-y-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  const isAssignedTechnician =
    user?.role === 'technician' &&
    job.assignments?.some((a) => a.technician.id === user.id);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{job.customerName}</h1>
              {getStatusBadge(job.status)}
              {job.archivedAt && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-500 border-slate-200">
                  Archived
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate max-w-md">{job.siteAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'dispatcher' && (
            <>
              <button
                type="button"
                onClick={() => { setEditError(''); setShowEditModal(true); }}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100 border border-slate-200"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Job
              </button>
              <button
                type="button"
                onClick={handleArchiveToggle}
                disabled={isSubmitting}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border disabled:opacity-50 ${
                  job.archivedAt
                    ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    : 'text-red-600 border-red-200 hover:bg-red-50'
                }`}
              >
                {job.archivedAt
                  ? <><ArchiveRestore className="w-3.5 h-3.5" /> Restore Job</>
                  : <><Archive className="w-3.5 h-3.5" /> Archive Job</>}
              </button>
            </>
          )}
          {getPriorityBadge(job.priority)}
        </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Site Description & Instructions
                </h2>
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                  {job.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                  <div>
                    <span className="block text-xs text-slate-400 font-medium">Location</span>
                    <span className="text-slate-700 font-medium">{job.siteAddress}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                  <div>
                    <span className="block text-xs text-slate-400 font-medium">Scheduled Window</span>
                    <span className="text-slate-700 font-medium">
                      {formatDate(job.scheduledDate)} at {formatTime(job.startTime)}
                    </span>
                    <span className="block text-xs text-slate-500">
                      Est. duration: {job.estimatedDurationMinutes} mins
                    </span>
                  </div>
                </div>
              </div>

              {job.completionNote && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 space-y-1">
                  <span className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completion Note
                  </span>
                  <p className="text-sm text-emerald-950">{job.completionNote}</p>
                </div>
              )}
            </div>

            {(user?.role === 'dispatcher' || isAssignedTechnician) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                {user?.role === 'dispatcher' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-blue-600" /> Assign Technician
                    </h3>
                    <div className="flex gap-2">
                      <select
                        value={technicianId}
                        onChange={(e) => setTechnicianId(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select a technician...</option>
                        {technicians?.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.email}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssign}
                        disabled={!technicianId || isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                )}

                {user?.role === 'dispatcher' && isAssignedTechnician && job.status !== 'completed' && (
                  <hr className="border-slate-100" />
                )}

                {isAssignedTechnician && job.status !== 'completed' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-600" /> Update Job Status
                    </h3>

                    {NEXT_STATUS[job.status] === 'completed' ? (
                      <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                            Completion Note
                          </label>
                          <textarea
                            placeholder="Provide details about the work completed..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows="2"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                            Add Part Used
                          </label>
                          <form onSubmit={handleAddPart} className="flex gap-2">
                            <input
                              placeholder="Part name"
                              value={partName}
                              onChange={(e) => setPartName(e.target.value)}
                              className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(Number(e.target.value))}
                              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-20 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                              type="submit"
                              disabled={!partName.trim() || isSubmitting}
                              className="bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Add
                            </button>
                          </form>
                        </div>

                        <button
                          onClick={handleAdvance}
                          disabled={isSubmitting}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
                          Complete Job
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAdvance}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        Advance to <span className="font-bold capitalize">{NEXT_STATUS[job.status]?.replace('_', ' ')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" /> Activity History
              </h2>

              {!timeline || timeline.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No activity recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {timeline.map((event) => (
                    <div key={event.id} className="relative group">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="flex items-baseline justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800 capitalize">
                          {event.eventType.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400">{formatDateTime(event.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {event.eventType === 'status_changed' ? (
                          <span>
                            Status updated from{' '}
                            <span className="font-medium text-slate-800">{event.oldValue}</span> to{' '}
                            <span className="font-medium text-slate-800">{event.newValue}</span>
                          </span>
                        ) : event.eventType === 'assigned' ? (
                          <span>Technician assigned</span>
                        ) : event.newValue ? (
                          <span>{event.newValue}</span>
                        ) : (
                          <span>Job initialized</span>
                        )}
                      </p>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        by {event.actor?.email} ({event.actor?.role})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Assigned Personnel
              </h3>
              {job.assignments && job.assignments.length > 0 ? (
                <div className="space-y-2">
                  {job.assignments.map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-800 truncate">{a.technician.email}</p>
                        <p className="text-xs text-slate-400">Assigned {formatDate(a.createdAt)}</p>
                      </div>
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded capitalize">
                        {a.technician.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No technicians assigned yet.</p>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Parts Used
              </h3>
              {job.partsUsed && job.partsUsed.length > 0 ? (
                <ul className="divide-y divide-slate-100 text-sm">
                  {job.partsUsed.map((part) => (
                    <li key={part.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{part.partName}</p>
                        <p className="text-xs text-slate-400">{formatDate(part.createdAt)}</p>
                      </div>
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                        Qty: {part.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No parts recorded for this job.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl relative border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-900">Edit Job</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Customer Name</label>
                <input
                  name="customerName"
                  required
                  defaultValue={job.customerName}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Site Address</label>
                <input
                  name="siteAddress"
                  required
                  defaultValue={job.siteAddress}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows="2"
                  defaultValue={job.description}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Priority</label>
                  <select
                    name="priority"
                    defaultValue={job.priority}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Duration (Mins)</label>
                  <input
                    name="duration"
                    type="number"
                    min="1"
                    required
                    defaultValue={job.estimatedDurationMinutes}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
                    <p>IMPORTANT: FOR NOW JOB RESCHEDULE IS NOT IMPLEMENTED</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Scheduled Date</label>
                  <input
                    name="scheduledDate"
                    type="date"
                    required
                    defaultValue={toDateInputValue(job.scheduledDate)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Start Time</label>
                  <input
                    name="startTime"
                    type="time"
                    required
                    defaultValue={toTimeInputValue(job.startTime)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}