import { useEffect, useState } from 'react';
import api from '../api';
import { 
  BellRing, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Check,
  Filter,
  Activity
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
      <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl shadow-premium dark:shadow-premium-dark border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-300">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
              <BellRing className="w-6 h-6 text-primary dark:text-cyanGlow" /> System Anomaly & Excursion Incidents
            </h1>
            {activeCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {activeCount} Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                All Systems Nominal
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Real-time thermal threshold engine and chamber door intrusion monitoring audit log
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'ALL' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'ACTIVE' 
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('ACKNOWLEDGED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'ACKNOWLEDGED' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Acknowledged
          </button>
        </div>
      </div>

      {/* Summary Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-flat dark:shadow-premium-dark flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Excursions</span>
            <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1 font-heading">{criticalCount}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-flat dark:shadow-premium-dark flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Warning Incidents</span>
            <p className="text-3xl font-extrabold text-amber-500 mt-1 font-heading">{warningCount}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-flat dark:shadow-premium-dark flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolution Compliance</span>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 font-heading">
              {alerts.length ? `${Math.round(((alerts.length - activeCount) / alerts.length) * 100)}% Addressed` : '100% Nominal'}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Alerts List Container */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark overflow-hidden transition-colors duration-300">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading alert feed...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white font-heading">No {filter !== 'ALL' ? filter.toLowerCase() : ''} alerts found</h3>
            <p className="text-xs text-slate-400 mt-1">Chamber telemetry readings are currently within programmed safety thresholds.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAlerts.map(alert => (
              <li key={alert.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3.5 rounded-2xl shadow-sm mt-0.5 ${
                    alert.severity === 'CRITICAL' 
                      ? 'bg-red-50 dark:bg-red-950/70 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' 
                      : 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
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
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-heading">
                      {alert.alert_type.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">{alert.message}</p>
                  </div>
                </div>

                <div>
                  {alert.status === 'ACTIVE' ? (
                    <button 
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acknowledgingId === alert.id}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-primary dark:to-blue-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-98 disabled:opacity-50 flex items-center gap-2 justify-center"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {acknowledgingId === alert.id ? 'Recording Audit...' : 'Acknowledge Incident'}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Acknowledged by Operator
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Compliance Quality Pill */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <Activity className="w-4 h-4 text-primary dark:text-cyanGlow" />
        <span>Incident logs are append-only and immutable in compliance with 21 CFR Part 11 requirements.</span>
      </div>
    </div>
  );
}
