import React, { useEffect, useState } from 'react';
import api from '../api';
import { Bell, CheckCircle, Clock } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id: int) => {
    try {
      await api.post(`/api/iot/alerts/${id}/acknowledge`);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Alerts</h1>
        <p className="text-slate-500">Monitor and acknowledge system anomalies.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-slate-500">Loading alerts...</div>
        ) : alerts.length === 0 ? (
           <div className="p-12 text-center text-slate-500 flex flex-col items-center">
             <CheckCircle className="w-12 h-12 mb-4 text-emerald-400" />
             <p>No alerts at this time. All systems nominal.</p>
           </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {alerts.map(alert => (
              <li key={alert.id} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className={`p-3 rounded-full mt-1 ${
                  alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(alert.created_at).toLocaleString()}
                    </span>
                    {alert.status === 'ACTIVE' ? (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">ACTIVE</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">ACKNOWLEDGED</span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-1">{alert.alert_type.replace(/_/g, ' ')}</h3>
                  <p className="text-slate-600">{alert.message}</p>
                </div>
                <div>
                  {alert.status === 'ACTIVE' && (
                    <button 
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Acknowledge
                    </button>
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
