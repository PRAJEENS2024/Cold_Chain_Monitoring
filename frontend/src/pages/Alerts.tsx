import { useEffect, useState } from 'react';
import api from '../api';
import { 
  BellRing, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Check
} from 'lucide-react';

interface AlertItem {
  id: number;
  alert_type: string;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_at: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED'>('ALL');
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/api/iot/alerts');
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id: number) => {
    setAcknowledgingId(id);
    try {
      await api.post(`/api/iot/alerts/${id}/acknowledge`);
      await fetchAlerts();
    } catch (e) {
      console.error(e);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ACTIVE') return a.status === 'ACTIVE';
    if (filter === 'ACKNOWLEDGED') return a.status === 'ACKNOWLEDGED';
    return true;
  });

  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING' && a.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-premium border border-slate-200/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
              <BellRing className="w-6 h-6 text-primary" /> System Anomaly & Excursion Alerts
            </h1>
            {activeCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-50 text-red-700 border border-red-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {activeCount} Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All Systems Nominal
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time threshold violation engine and chamber door intrusion monitoring log
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'ACTIVE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('ACKNOWLEDGED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'ACKNOWLEDGED' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Acknowledged
          </button>
        </div>
      </div>

      {/* Summary Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-flat flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Excursions</span>
            <p className="text-3xl font-extrabold text-red-600 mt-1 font-heading">{criticalCount}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-flat flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Warning Events</span>
            <p className="text-3xl font-extrabold text-amber-500 mt-1 font-heading">{warningCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-flat flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolution Status</span>
            <p className="text-xl font-extrabold text-slate-800 mt-1 font-heading">
              {alerts.length ? `${Math.round(((alerts.length - activeCount) / alerts.length) * 100)}% Addressed` : '100% Nominal'}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Alerts List Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-premium overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading alert feed...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <div className="p-4 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-600 mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-heading">No {filter !== 'ALL' ? filter.toLowerCase() : ''} alerts found</h3>
            <p className="text-xs text-slate-400 mt-1">Chamber telemetry readings are currently within programmed safety thresholds.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredAlerts.map(alert => (
              <li key={alert.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3.5 rounded-2xl shadow-sm mt-0.5 ${
                    alert.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {alert.severity === 'CRITICAL' ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" /> {new Date(alert.created_at).toLocaleString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        alert.status === 'ACTIVE' 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight font-heading">
                      {alert.alert_type.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{alert.message}</p>
                  </div>
                </div>

                <div>
                  {alert.status === 'ACTIVE' ? (
                    <button 
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acknowledgingId === alert.id}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-98 disabled:opacity-50 flex items-center gap-2 justify-center"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {acknowledgingId === alert.id ? 'Updating...' : 'Acknowledge'}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Acknowledged
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
