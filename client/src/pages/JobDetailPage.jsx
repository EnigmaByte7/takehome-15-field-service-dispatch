import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getJob, getTimeline, transitionStatus, addPart, assignTechnician } from '../api/jobs';
import { getTechnicians } from '../api/users';
import { useAuth } from '../context/AuthContext';

const NEXT_STATUS = {
  assigned: 'en_route',
  en_route: 'on_site',
  on_site: 'completed',
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [partName, setPartName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [technicianId, setTechnicianId] = useState('');
  const [error, setError] = useState('');

  const { data: job, isLoading } = useQuery({
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
    try {
      await transitionStatus(id, next, next === 'completed' ? note : undefined);
      refresh();
    } catch (err) {
      setError(err.message || 'Failed');
    }
  }

  async function handleAddPart() {
    setError('');
    try {
      await addPart(id, partName, quantity);
      setPartName('');
      setQuantity(1);
      refresh();
    } catch (err) {
      setError(err.message || 'Failed');
    }
  }

  async function handleAssign() {
    setError('');
    try {
      await assignTechnician(id, technicianId);
      setTechnicianId('');
      refresh();
    } catch (err) {
      setError(err.message || 'Failed');
    }
  }

  if (isLoading || !job) return <div className="p-6">Loading...</div>;

  const isAssignedTechnician =
    user?.role === 'technician' &&
    job.assignments.some((a) => a.technician.id === user.id);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{job.customerName}</h1>
        <p className="text-gray-500">{job.siteAddress}</p>
        <p>{job.description}</p>
        <p className="text-sm mt-1">
          Status: <span className="font-medium">{job.status}</span> · Priority: {job.priority}
        </p>
        <p className="text-sm">
          Scheduled: {job.scheduledDate.slice(0, 10)} at {job.startTime.slice(11, 16)} ({job.estimatedDurationMinutes}m)
        </p>
        <p className="text-sm">
          Technicians: {job.assignments.map((a) => a.technician.email).join(', ') || 'Unassigned'}
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {user?.role === 'dispatcher' && (
        <div className="border rounded p-4 space-y-2">
          <h2 className="font-medium">Assign Technician</h2>
          <select
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Select a technician</option>
            {technicians?.map((t) => (
              <option key={t.id} value={t.id}>{t.email}</option>
            ))}
          </select>
          <button onClick={handleAssign} className="bg-blue-600 text-white px-3 py-1 rounded">
            Assign
          </button>
        </div>
      )}

      {isAssignedTechnician && job.status !== 'completed' && (
        <div className="border rounded p-4 space-y-2">
          <h2 className="font-medium">Update Status</h2>
          {NEXT_STATUS[job.status] === 'completed' && (
            <>
              <textarea
                placeholder="Completion note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />
              <div className="flex gap-2">
                <input
                  placeholder="Part name"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="border rounded px-2 py-1 flex-1"
                />
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border rounded px-2 py-1 w-20"
                />
                <button onClick={handleAddPart} className="bg-gray-600 text-white px-3 py-1 rounded">
                  Add Part
                </button>
              </div>
            </>
          )}
          <button onClick={handleAdvance} className="bg-green-600 text-white px-3 py-1 rounded">
            Move to {NEXT_STATUS[job.status]}
          </button>
        </div>
      )}

      <div>
        <h2 className="font-medium mb-2">Timeline</h2>
        <ul className="text-sm space-y-1">
          {timeline?.map((event) => (
            <li key={event.id} className="border-b py-1">
              {event.eventType} {event.oldValue ? `(${event.oldValue} → ${event.newValue})` : event.newValue ? `: ${event.newValue}` : ''} — {event.actor.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}