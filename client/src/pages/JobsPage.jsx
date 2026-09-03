import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getJobs, createJob } from '../api/jobs';
import { useAuth } from '../context/AuthContext';

export default function JobsPage() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', search],
    queryFn: () => getJobs(search ? { search } : {}),
  });

  async function handleCreate(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await createJob({
      customerName: form.get('customerName'),
      siteAddress: form.get('siteAddress'),
      description: form.get('description'),
      priority: form.get('priority'),
      scheduledDate: form.get('scheduledDate'),
      startTime: `${form.get('scheduledDate')}T${form.get('startTime')}:00`,
      estimatedDurationMinutes: Number(form.get('duration')),
    });
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Dispatch Queue</h1>
        <div className="space-x-2">
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-3 py-1 rounded">
            New Job
          </button>
          <button onClick={logout} className="text-gray-500">Logout</button>
        </div>
      </div>

      <input
        placeholder="Search customer or address"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-3 py-2 w-full mb-4"
      />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded mb-4 space-y-2">
          <input name="customerName" placeholder="Customer name" required className="border rounded px-2 py-1 w-full" />
          <input name="siteAddress" placeholder="Site address" required className="border rounded px-2 py-1 w-full" />
          <input name="description" placeholder="Description" required className="border rounded px-2 py-1 w-full" />
          <select name="priority" className="border rounded px-2 py-1 w-full">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <input name="scheduledDate" type="date" required className="border rounded px-2 py-1 w-full" />
          <input name="startTime" type="time" required className="border rounded px-2 py-1 w-full" />
          <input name="duration" type="number" placeholder="Duration (minutes)" required className="border rounded px-2 py-1 w-full" />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
        </form>
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Customer</th>
              <th>Status</th>
              <th>Scheduled</th>
              <th>Technician(s)</th>
            </tr>
          </thead>
          <tbody>
            {data?.jobs.map((job) => (
              <tr key={job.id} className="border-b hover:bg-gray-50">
                <td className="py-2">
                  <Link to={`/jobs/${job.id}`} className="text-blue-600">{job.customerName}</Link>
                </td>
                <td>{job.status}</td>
                <td>{job.scheduledDate.slice(0, 10)}</td>
                <td>{job.assignments.map((a) => a.technician.email).join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {data && <p className="text-sm text-gray-500 mt-2">{data.total} total jobs</p>}
    </div>
  );
}