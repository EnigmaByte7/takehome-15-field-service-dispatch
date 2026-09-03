import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getJobs } from '../api/jobs';
import { useAuth } from '../context/AuthContext';

export default function MyJobsPage() {
  const { logout } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['my-jobs'], queryFn: () => getJobs() });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">My Jobs</h1>
        <button onClick={logout} className="text-gray-500">Logout</button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {data?.jobs.map((job) => (
            <li key={job.id} className="border rounded p-3 hover:bg-gray-50">
              <Link to={`/jobs/${job.id}`}>
                <div className="font-medium">{job.customerName}</div>
                <div className="text-sm text-gray-500">{job.siteAddress}</div>
                <div className="text-sm">{job.status} — {job.scheduledDate.slice(0, 10)}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}