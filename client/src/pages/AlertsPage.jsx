import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, MapPin, X } from 'lucide-react';
import { getAlerts, dismissAlert } from '../api/alerts';

export default function AlertsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading, isError } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
  });

  async function handleDismiss(alertId) {
    try {
      await dismissAlert(alertId);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-count'] });
    } catch (err) {
      console.error('Failed to dismiss alert', err);
    }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Running Late Alerts</h1>
            <p className="text-xs text-slate-500">Jobs past their scheduled window and not yet completed</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse h-20" />
          ))
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
            Failed to load alerts.
          </div>
        ) : alerts?.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
            No active alerts. Every job is on track.
          </div>
        ) : (
          alerts?.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <Link
                    to={`/jobs/${alert.jobId}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 truncate block"
                  >
                    {alert.job.customerName}
                  </Link>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{alert.job.siteAddress}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-700 mt-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Was due by {formatDateTime(alert.windowEnd)}
                  </div>
                  {alert.reappearedFromId && (
                    <p className="text-xs text-slate-400 mt-1 italic">
                      Reappeared after rescheduling
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDismiss(alert.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg shrink-0"
              >
                <X className="w-3.5 h-3.5" /> Dismiss
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}