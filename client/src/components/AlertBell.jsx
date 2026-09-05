import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAlertCount } from '../api/alerts';

export default function AlertBell() {
  const { data } = useQuery({
    queryKey: ['alert-count'],
    queryFn: getAlertCount,
    refetchInterval: 30000,
  });

  const count = data?.count ?? 0;

  return (
    <Link
      to="/alerts"
      className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
      aria-label="Alerts"
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}